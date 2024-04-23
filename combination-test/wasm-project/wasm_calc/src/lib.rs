#[no_mangle]
pub extern "C" fn perform_computation() -> f64 {
    let mut x: i64 = 0;
    for i in 0..6000000000i64 {  // Explicitly specifying i64 type
        x = (i - 100).abs();
    }
    x as f64
}
