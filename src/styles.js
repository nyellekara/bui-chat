const CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0f1012; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif; overflow: hidden; }
button, textarea, input { font: inherit; }
.app-root { display: flex; flex-direction: column; width: 100%; height: 100%; background: radial-gradient(circle at 50% -20%, #1a1d26 0%, #111214 34%, #0f1012 70%); overflow: hidden; position: relative; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 22px; border-bottom: 1px solid rgba(255,255,255,.07); background: rgba(17,18,20,.76); backdrop-filter: blur(20px); height: 58px; flex-shrink: 0; }
.brand { display: flex; align-items: center; gap: 10px; }
.logo-badge { width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(145deg, #f4f4f5, #a7a7ad); color: #18191c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 1px 0 rgba(255,255,255,.5) inset, 0 4px 12px rgba(0,0,0,.28); }
.brand-title { font-weight: 650; font-size: 13px; letter-spacing: -.15px; color: #f4f4f5; }
.model-pill { display: flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 999px; font-size: 10px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.08); color: #b9bbc2; }
.dot-green { width: 6px; height: 6px; border-radius: 50%; background: #65d48b; box-shadow: 0 0 0 3px rgba(101,212,139,.13); }
.top-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn { display: flex; align-items: center; justify-content: center; gap: 5px; height: 31px; padding: 0 11px; border-radius: 9px; background: transparent; border: 1px solid transparent; color: #9da0a8; font-size: 11px; cursor: pointer; transition: all .18s ease; }
.icon-btn:hover { background: rgba(255,255,255,.07); color: #f5f5f7; border-color: rgba(255,255,255,.08); }
.primary-action { color: #f5f5f7; background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.08); }
.button-symbol { font-size: 15px; line-height: 1; color: #fff; }
.count-badge { min-width: 17px; padding: 1px 5px; border-radius: 999px; background: rgba(255,255,255,.1); color: #c9cad0; font-size: 10px; }
.hero-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px 52px; max-width: 760px; width: 100%; margin: 0 auto; }
.hero-kicker { display: flex; align-items: center; gap: 8px; color: #9ea1aa; font-size: 11px; letter-spacing: .1px; margin-bottom: 18px; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #65d48b; box-shadow: 0 0 0 4px rgba(101,212,139,.1); }
.hero-title { font-size: 34px; line-height: 1.08; font-weight: 650; margin: 0 0 10px; text-align: center; color: #f6f6f7; letter-spacing: -1.25px; }
.hero-sub { font-size: 14px; color: #8e919a; margin: 0 0 30px; text-align: center; }
.input-card { width: 100%; border-radius: 18px; background: rgba(29,30,34,.78); border: 1px solid rgba(255,255,255,.12); padding: 15px; box-shadow: 0 18px 46px rgba(0,0,0,.28), 0 1px 0 rgba(255,255,255,.04) inset; display: flex; flex-direction: column; gap: 10px; transition: border-color .2s ease, box-shadow .2s ease; }
.input-card:focus-within { border-color: rgba(255,255,255,.28); box-shadow: 0 18px 46px rgba(0,0,0,.33), 0 0 0 3px rgba(255,255,255,.045); }
.prompt-area { width: 100%; background: transparent; border: none; color: #f5f5f7; font-size: 14px; outline: none; resize: none; min-height: 64px; line-height: 1.5; }
.prompt-area::placeholder { color: #777a83; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.075); }
.key-hint { font-size: 10px; color: #777a83; }
.send-btn { padding: 7px 14px; border-radius: 10px; background: #f3f3f4; color: #1b1c20; font-weight: 650; font-size: 11px; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: transform .16s ease, background .16s ease; }
.send-btn:hover { background: #fff; transform: translateY(-1px); }
.send-btn:disabled { background: rgba(255,255,255,.09); color: #6f727b; cursor: not-allowed; transform: none; }
.stop-btn { background: #f06b6b; color: #fff; }
.stop-btn:hover { background: #ff7c7c; }
.chips-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; width: 100%; }
.chip { padding: 8px 13px; border-radius: 999px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); font-size: 11px; color: #a4a6ad; cursor: pointer; transition: all .18s ease; }
.chip:hover { background: rgba(255,255,255,.1); color: #f5f5f7; border-color: rgba(255,255,255,.15); transform: translateY(-1px); }
.chat-container { flex: 1; display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
.messages-scroll { flex: 1; overflow-y: auto; padding: 30px 24px 18px; display: flex; flex-direction: column; gap: 18px; max-width: 820px; width: 100%; margin: 0 auto; }
.msg { display: flex; flex-direction: column; gap: 8px; padding: 14px 17px; border-radius: 16px; line-height: 1.58; font-size: 13px; max-width: 86%; animation: rise-in .24s ease both; }
@keyframes rise-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.msg-user { margin-left: auto; background: #e9e9eb; color: #1b1c20; border: 1px solid rgba(255,255,255,.32); box-shadow: 0 8px 22px rgba(0,0,0,.12); }
.msg-assistant { margin-right: auto; background: rgba(28,29,33,.72); border: 1px solid rgba(255,255,255,.1); color: #e5e5e8; box-shadow: 0 8px 24px rgba(0,0,0,.16); }
.msg-header { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #888b93; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,.08); }
.msg-user .msg-header { color: #777a82; border-color: rgba(0,0,0,.08); }
.msg-sender { font-weight: 650; color: inherit; }
.code-box { margin: 8px 0; border-radius: 10px; background: #111216; border: 1px solid rgba(255,255,255,.1); overflow: hidden; }
.code-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(255,255,255,.045); border-bottom: 1px solid rgba(255,255,255,.08); font-size: 10px; color: #b6b8bf; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.code-copy { background: transparent; border: none; color: #a5a7af; cursor: pointer; font-size: 10px; }
.code-copy:hover { color: #fff; }
.code-content { padding: 11px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; color: #d1d2d7; overflow-x: auto; white-space: pre; }
.message-actions { display: flex; gap: 7px; padding-top: 3px; }
.text-btn { padding: 3px 7px; border-radius: 6px; background: rgba(255,255,255,.06); border: 1px solid transparent; color: #9699a1; cursor: pointer; font-size: 10px; }
.text-btn:hover { color: #f5f5f7; border-color: rgba(255,255,255,.1); }
.generating-state { color: #9da0a8; font-style: italic; font-size: 12px; display: flex; align-items: center; gap: 7px; }
.generating-dot { width: 6px; height: 6px; border-radius: 50%; background: #f2f2f3; animation: blink 1s infinite ease-in-out; }
@keyframes blink { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
.error-card { padding: 12px; border-radius: 12px; background: rgba(104,31,35,.35); border: 1px solid rgba(240,107,107,.35); color: #f2b1b1; font-size: 12px; }
.error-title { font-weight: 650; color: #ff9696; margin-bottom: 4px; }
.error-retry { margin-top: 8px; padding: 5px 12px; border-radius: 7px; background: #e66a6a; color: #fff; border: none; cursor: pointer; font-size: 11px; }
.composer-wrap { width: 100%; max-width: 820px; margin: 0 auto; padding: 10px 24px 22px; }
@media (max-width: 620px) { .model-pill { display: none; } .top-bar { padding: 0 14px; } .hero-title { font-size: 29px; } .msg { max-width: 94%; } .messages-scroll, .composer-wrap { padding-left: 14px; padding-right: 14px; } }
`

module.exports = { CSS }
