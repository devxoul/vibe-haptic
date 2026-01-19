use napi::bindgen_prelude::*;
use napi_derive::napi;

#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::c_void;
    use std::ptr;

    pub type IOReturn = i32;
    pub type CFMutableDictionaryRef = *mut c_void;
    pub type CFStringRef = *const c_void;
    pub type CFNumberRef = *const c_void;
    pub type CFTypeRef = *const c_void;

    pub const IO_OBJECT_NULL: u32 = 0;
    pub const KERN_SUCCESS: IOReturn = 0;

    #[link(name = "IOKit", kind = "framework")]
    extern "C" {
        pub fn IOServiceMatching(name: *const i8) -> CFMutableDictionaryRef;
        pub fn IOServiceGetMatchingServices(
            main_port: u32,
            matching: CFMutableDictionaryRef,
            existing: *mut u32,
        ) -> IOReturn;
        pub fn IOIteratorNext(iterator: u32) -> u32;
        pub fn IORegistryEntryCreateCFProperty(
            entry: u32,
            key: CFStringRef,
            allocator: *const c_void,
            options: u32,
        ) -> CFTypeRef;
        pub fn IOObjectRelease(object: u32) -> IOReturn;
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    extern "C" {
        pub fn CFStringCreateWithCString(
            alloc: *const c_void,
            c_str: *const i8,
            encoding: u32,
        ) -> CFStringRef;
        pub fn CFNumberGetValue(
            number: CFNumberRef,
            the_type: i32,
            value_ptr: *mut c_void,
        ) -> bool;
        pub fn CFRelease(cf: *const c_void);
        pub fn CFGetTypeID(cf: CFTypeRef) -> u64;
        pub fn CFBooleanGetTypeID() -> u64;
        pub fn CFBooleanGetValue(boolean: CFTypeRef) -> bool;
    }

    pub const K_CF_STRING_ENCODING_UTF8: u32 = 0x08000100;
    pub const K_CF_NUMBER_SINT64_TYPE: i32 = 4;

    #[link(name = "MultitouchSupport", kind = "framework")]
    extern "C" {
        pub fn MTActuatorCreateFromDeviceID(device_id: u64) -> *mut c_void;
        pub fn MTActuatorOpen(actuator: *mut c_void) -> i32;
        pub fn MTActuatorClose(actuator: *mut c_void) -> i32;
        pub fn MTActuatorActuate(
            actuator: *mut c_void,
            actuation_id: i32,
            unknown: u32,
            unknown2: f32,
            intensity: f32,
        ) -> i32;
    }

    pub fn find_trackpad_device() -> Option<u64> {
        unsafe {
            let matching = IOServiceMatching(b"AppleMultitouchDevice\0".as_ptr() as *const i8);
            if matching.is_null() {
                return None;
            }

            let mut iterator: u32 = 0;
            let result = IOServiceGetMatchingServices(0, matching, &mut iterator);
            if result != KERN_SUCCESS {
                return None;
            }

            let device_id_key = CFStringCreateWithCString(
                ptr::null(),
                b"Multitouch ID\0".as_ptr() as *const i8,
                K_CF_STRING_ENCODING_UTF8,
            );
            let actuation_key = CFStringCreateWithCString(
                ptr::null(),
                b"ActuationSupported\0".as_ptr() as *const i8,
                K_CF_STRING_ENCODING_UTF8,
            );

            let mut found_device_id: Option<u64> = None;

            loop {
                let service = IOIteratorNext(iterator);
                if service == IO_OBJECT_NULL {
                    break;
                }

                let actuation_ref =
                    IORegistryEntryCreateCFProperty(service, actuation_key, ptr::null(), 0);

                let supports_actuation = if !actuation_ref.is_null() {
                    let is_boolean = CFGetTypeID(actuation_ref) == CFBooleanGetTypeID();
                    let result = if is_boolean {
                        CFBooleanGetValue(actuation_ref)
                    } else {
                        false
                    };
                    CFRelease(actuation_ref);
                    result
                } else {
                    false
                };

                if supports_actuation {
                    let device_id_ref =
                        IORegistryEntryCreateCFProperty(service, device_id_key, ptr::null(), 0);

                    if !device_id_ref.is_null() {
                        let mut device_id: i64 = 0;
                        if CFNumberGetValue(
                            device_id_ref as CFNumberRef,
                            K_CF_NUMBER_SINT64_TYPE,
                            &mut device_id as *mut i64 as *mut c_void,
                        ) {
                            found_device_id = Some(device_id as u64);
                        }
                        CFRelease(device_id_ref);
                    }
                }

                IOObjectRelease(service);

                if found_device_id.is_some() {
                    break;
                }
            }

            CFRelease(device_id_key as *const c_void);
            CFRelease(actuation_key as *const c_void);
            IOObjectRelease(iterator);

            found_device_id
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn find_trackpad_device() -> Option<u64> {
    None
}

#[cfg(target_os = "macos")]
fn find_trackpad_device() -> Option<u64> {
    macos::find_trackpad_device()
}

#[napi]
pub fn is_supported() -> bool {
    find_trackpad_device().is_some()
}

#[napi]
pub fn actuate(actuation_id: u32, intensity: f64) -> Result<()> {
    #[cfg(target_os = "macos")]
    {
        let device_id = find_trackpad_device()
            .ok_or_else(|| Error::from_reason("No supported trackpad found"))?;

        unsafe {
            let actuator = macos::MTActuatorCreateFromDeviceID(device_id);
            if actuator.is_null() {
                return Err(Error::from_reason("Failed to create actuator"));
            }

            let open_result = macos::MTActuatorOpen(actuator);
            if open_result != 0 {
                macos::MTActuatorClose(actuator);
                return Err(Error::from_reason("Failed to open actuator"));
            }

            macos::MTActuatorActuate(actuator, actuation_id as i32, 0, 0.0, intensity as f32);
            macos::MTActuatorClose(actuator);
        }

        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err(Error::from_reason("Haptic feedback only supported on macOS"))
    }
}

#[napi]
pub fn click() -> Result<()> {
    actuate(6, 1.0)
}

#[napi]
pub fn weak_click() -> Result<()> {
    actuate(1, 0.5)
}

#[napi]
pub fn strong_click() -> Result<()> {
    actuate(15, 1.0)
}
