// This benchmark only runs the Tauri window; it does not build an installer.
// Avoid tauri-build's Windows resource generation, which requires an icon.ico
// even when bundling is disabled.
fn main() {}
