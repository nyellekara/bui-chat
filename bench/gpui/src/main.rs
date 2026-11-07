use gpui::{
    div, prelude::*, px, rgb, size, App, Bounds, Context, Render, SharedString, Window,
    WindowBounds, WindowOptions,
};
use std::{
    fs,
    path::PathBuf,
    time::{Duration, Instant},
};

struct Benchmark {
    messages: Vec<(bool, SharedString)>,
    streamed: usize,
    chunks: usize,
    started: Instant,
    stream_started: Instant,
    output: PathBuf,
}

impl Render for Benchmark {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let mut content = div()
            .flex()
            .flex_col()
            .gap_2()
            .size_full()
            .bg(rgb(0x0f1012))
            .text_color(rgb(0xf2f2f4))
            .p_6();
        for (is_user, text) in &self.messages {
            content = content.child(
                div()
                    .max_w(px(700.))
                    .rounded_md()
                    .p_3()
                    .bg(if *is_user {
                        rgb(0xe9e9eb)
                    } else {
                        rgb(0x1d1e22)
                    })
                    .text_color(if *is_user {
                        rgb(0x1c1d20)
                    } else {
                        rgb(0xf2f2f4)
                    })
                    .child(text.clone()),
            );
        }
        content.child(format!("Streaming tokens: {}", self.streamed))
    }
}

fn main() {
    gpui::Application::new().run(|cx: &mut App| {
        let bounds = Bounds::centered(None, size(px(1080.), px(720.)), cx);
        let output = std::env::var("BENCH_OUT").map(PathBuf::from).unwrap_or_else(|_| PathBuf::from("gpui-result.json"));
        let started = Instant::now();
        cx.open_window(WindowOptions { window_bounds: Some(WindowBounds::Windowed(bounds)), ..Default::default() }, move |_, cx| {
            let messages = (0..500).map(|i| (i % 2 == 0, format!("{} message {}: native retained UI benchmark fixture.", if i % 2 == 0 { "User" } else { "Assistant" }, i).into())).collect();
            let entity = cx.new(|_| Benchmark { messages, streamed: 0, chunks: 0, started, stream_started: Instant::now(), output: output.clone() });
            let task_entity = entity.clone();
            cx.spawn(async move |cx| {
                let stream_started = Instant::now();
                for _ in 0..500 {
                    cx.background_executor().timer(Duration::from_millis(16)).await;
                    task_entity.update(cx, |view, cx| { view.streamed += 20; view.chunks += 1; view.stream_started = stream_started; cx.notify(); }).ok();
                }
                task_entity.update(cx, |view, _| {
                    let result = serde_json::json!({ "runtime": "gpui", "pid": std::process::id(), "startupMs": view.started.elapsed().as_secs_f64() * 1000.0, "streamMs": view.stream_started.elapsed().as_secs_f64() * 1000.0, "streamedTokens": view.streamed, "streamChunks": view.chunks, "fixtureMessages": view.messages.len() });
                    let _ = fs::write(&view.output, serde_json::to_string_pretty(&result).unwrap());
                }).ok();
                // AsyncApp does not expose quit directly; hop back to the
                // application context before requesting shutdown.
                let _ = cx.update(|cx| cx.quit());
            }).detach();
            entity
        }).unwrap();
        cx.activate(true);
    });
}
