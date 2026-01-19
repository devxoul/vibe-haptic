extern crate napi_build;

fn main() {
  napi_build::setup();
  
  #[cfg(target_os = "macos")]
  {
    println!("cargo:rustc-link-search=framework=/System/Library/PrivateFrameworks");
  }
}
