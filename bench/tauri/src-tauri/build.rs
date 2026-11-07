fn main() {
    // Keep Tauri's manifest and build metadata. Disabling its build script
    // also drops the Windows common-controls manifest needed at launch.
    let icon = std::path::PathBuf::from(std::env::var_os("OUT_DIR").unwrap()).join("benchmark.ico");
    let mut bytes = vec![0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 32, 0];
    bytes.extend_from_slice(&48u32.to_le_bytes());
    bytes.extend_from_slice(&22u32.to_le_bytes());
    bytes.extend_from_slice(&40u32.to_le_bytes());
    bytes.extend_from_slice(&1i32.to_le_bytes());
    bytes.extend_from_slice(&2i32.to_le_bytes());
    bytes.extend_from_slice(&1u16.to_le_bytes());
    bytes.extend_from_slice(&32u16.to_le_bytes());
    bytes.extend_from_slice(&[0; 24]);
    bytes.extend_from_slice(&[80, 80, 80, 255, 0, 0, 0, 0]);
    std::fs::write(&icon, bytes).expect("write benchmark icon");
    tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(
        tauri_build::WindowsAttributes::new().window_icon_path(icon),
    )).expect("Tauri build setup");
}
