// Every row is [English, Simplified Chinese, Japanese]. Keep keys stable across UI modules.
export const languages = ["en", "zh", "ja"];
export const messages = {
  "nav.home": ["Home", "首页", "ホーム"],
  "nav.destinations": ["Destinations", "目的地", "目的地"],
  "nav.community": ["Community", "旅行社区", "コミュニティ"],
  "nav.label": ["Primary navigation", "主导航", "メインナビゲーション"],
  "nav.brand": ["Budarina home", "Budarina 首页", "Budarina ホーム"],
  "nav.language": ["Language", "语言", "言語"],
  "nav.skip": ["Skip to content", "跳到正文", "本文へスキップ"],
  "atlas.label": ["Interactive atlas", "互动文字地图", "触れる言葉の地図"],
  "atlas.all": ["All four", "四国总览", "4か国を一覧"],
  "atlas.focus": ["Focus view", "单国视图", "個別表示"],
  "atlas.previous": ["Previous", "上一个", "前へ"],
  "atlas.next": ["Next", "下一个", "次へ"],
  "atlas.eyebrow": [
    "Four structures / four languages",
    "四种建筑 / 四种语言",
    "4つの建築 / 4つの言語",
  ],
  "atlas.heading1": ["Move through", "走进", "言葉の地図を"],
  "atlas.heading2": ["the archive", "文字之间", "めぐる"],
  "atlas.hint": [
    "Move across the language",
    "拨动文字，感受流动",
    "文字に触れて、揺らしてみよう",
  ],
  "atlas.open": ["Explore {name}", "探索{name}", "{name}を探索"],
  "atlas.destination": ["{name} destination", "{name}目的地", "{name}のページ"],
  "atlas.roof": [
    "{name} architectural roof study",
    "{name}建筑屋顶图",
    "{name}の建築の屋根",
  ],
  "footer.notes": [
    "Silk Road field notes",
    "丝路旅行手记",
    "シルクロードの旅のノート",
  ],
  "footer.home": [
    "Move through the text · Arrow keys to travel",
    "拨动文字 · 方向键切换国家",
    "文字を揺らす · 矢印キーで国を切り替え",
  ],
  "footer.content": [
    "A place for words that travel",
    "让文字随旅途流动",
    "旅する言葉が集まる場所",
  ],
  "footer.index": [
    "Budarina / Field notes",
    "Budarina / 旅行手记",
    "Budarina / 旅のノート",
  ],
  "title.home": [
    "Budarina — Tactile Atlas",
    "Budarina — 可触摸的文字地图",
    "Budarina — 触れる言葉の地図",
  ],
  "dest.eyebrow": ["The atlas / 01—04", "目的地图集 / 01—04", "地図 / 01—04"],
  "dest.title1": ["Places to pause.", "停留于此，", "足を止める場所。"],
  "dest.title2": ["Words to move.", "让文字流动。", "動き出す言葉。"],
  "dest.description": [
    "Four places, four languages. Explore their roofs, words, and the small details that make each one feel different.",
    "四个地方，四种语言。从屋顶、文字与细微之处，感受各地独特的气息。",
    "4つの場所、4つの言語。屋根や言葉、その土地らしさを感じる小さな違いを探してみましょう。",
  ],
  "dest.enter": [
    "Enter the curtain ↗",
    "进入文字帘 ↗",
    "文字のカーテンへ ↗",
  ],
  "dest.closer": ["A little closer", "再走近一点", "もう少し近くへ"],
  "dest.callout": [
    "Every journey leaves a note.",
    "每段旅途，都留下一则手记。",
    "旅の思い出を、ひと言に。",
  ],
  "dest.calloutText": [
    "A place you remember. A word you learned. A detail someone else might miss.",
    "一个难忘的地方，一个新学的词，或一处别人可能错过的细节。",
    "心に残る場所。覚えた言葉。誰かが見過ごしてしまうような、小さな発見。",
  ],
  "dest.read": [
    "Read the field notes ↗",
    "阅读旅行手记 ↗",
    "旅のノートを読む ↗",
  ],
  "community.eyebrow": [
    "The shared notebook",
    "共同书写的旅行手记",
    "みんなの旅のノート",
  ],
  "community.title1": ["Some places stay.", "有些地方，", "心に残る場所。"],
  "community.title2": ["Tell us why.", "值得写下来。", "その理由を聞かせて。"],
  "community.description": [
    "Leave a memory, a small discovery, or a question for the next traveler. These field notes are shared with everyone.",
    "留下一段回忆、一个小发现，或给下一位旅行者的问题。这里的手记向所有人公开。",
    "思い出や小さな発見、次の旅人への質問を残してみませんか。ここに書かれたノートは、誰でも読むことができます。",
  ],
  "form.eyebrow": ["Add a field note", "写一则旅行手记", "ノートを書く"],
  "form.title1": ["A few words", "用几句话，", "あなたの旅を、"],
  "form.title2": ["from your journey.", "记下你的旅途。", "少しだけ。"],
  "form.name": ["Your name", "你的名字", "お名前"],
  "form.namePlaceholder": [
    "How should we call you?",
    "怎么称呼你？",
    "どのようにお呼びしましょうか？",
  ],
  "form.place": ["A place", "目的地", "場所"],
  "form.message": ["Your field note", "你的旅行手记", "旅のノート"],
  "form.messagePlaceholder": [
    "What stayed with you?",
    "什么让你印象深刻？",
    "どんなことが心に残りましたか？",
  ],
  "form.public": [
    "Shared publicly · No email needed",
    "公开分享 · 无需邮箱",
    "全体に公開 · メールアドレス不要",
  ],
  "form.publish": ["Publish field note ↗", "发布手记 ↗", "ノートを投稿 ↗"],
  "form.ownership": [
    "You can remove your own notes from this browser. Keep your browser data to retain that access.",
    "你可以在这个浏览器中删除自己发布的手记。请保留浏览器数据，以便日后管理。",
    "このブラウザーから自分のノートを削除できます。後から管理できるよう、ブラウザーのデータを保存しておいてください。",
  ],
  "board.title": ["From the road", "来自旅途", "旅先からの便り"],
  "board.refresh": ["Refresh ↻", "刷新 ↻", "更新 ↻"],
  "board.filter": [
    "Filter field notes by place",
    "按目的地筛选手记",
    "場所でノートを絞り込む",
  ],
  "board.all": ["All places", "全部目的地", "すべての場所"],
  "board.more": ["More field notes", "加载更多手记", "もっと読む"],
  "board.remove": ["Remove my note", "删除我的手记", "自分のノートを削除"],
  "status.loading": [
    "Loading field notes…",
    "正在加载手记…",
    "ノートを読み込んでいます…",
  ],
  "status.empty": [
    "The notebook is open. Be the first to leave a field note here.",
    "这里还没有手记，来写下第一则吧。",
    "まだノートはありません。最初のひと言を残してみませんか。",
  ],
  "status.sending": [
    "Publishing your field note…",
    "正在发布你的手记…",
    "ノートを投稿しています…",
  ],
  "status.published": [
    "Published. Your field note is now shared with everyone.",
    "发布成功，所有访客都能看到你的手记。",
    "投稿しました。あなたのノートが公開されました。",
  ],
  "status.removed": [
    "Your note has been removed.",
    "你的手记已删除。",
    "ノートを削除しました。",
  ],
  "error.unavailable": [
    "The notebook is unavailable. Please try again.",
    "手记暂时无法访问，请稍后重试。",
    "現在ノートを利用できません。しばらくしてからお試しください。",
  ],
  "error.load": [
    "Could not load the notes. Use Refresh to try again.",
    "手记加载失败，请点击刷新重试。",
    "ノートを読み込めませんでした。「更新」でもう一度お試しください。",
  ],
  "error.storage": [
    "Allow browser storage so you can manage your notes later.",
    "请允许浏览器保存数据，以便日后管理自己的手记。",
    "後から自分のノートを管理できるよう、ブラウザーへのデータ保存を許可してください。",
  ],
  "error.name": [
    "Use a name between 1 and 40 characters.",
    "请输入 1 至 40 个字符的名字。",
    "お名前は1〜40文字で入力してください。",
  ],
  "error.message": [
    "Write a note between 3 and 500 characters.",
    "手记内容需为 3 至 500 个字符。",
    "ノートは3〜500文字で入力してください。",
  ],
  "error.country": [
    "Choose one of the four places.",
    "请选择一个目的地。",
    "4つの場所から1つ選んでください。",
  ],
  "error.refresh": [
    "Please refresh the page and try again.",
    "请刷新页面后重试。",
    "ページを更新して、もう一度お試しください。",
  ],
  "error.owner": [
    "This note is unavailable or belongs to another visitor.",
    "这则手记不存在，或不属于当前浏览器。",
    "このノートは見つからないか、別の訪問者のものです。",
  ],
  "error.cooldown": [
    "Please wait 30 seconds before publishing another note.",
    "请等待 30 秒后再发布下一则手记。",
    "次のノートを投稿するまで30秒お待ちください。",
  ],
};

export const countryTranslations = {
  zh: {
    vietnam: {
      name: "越南",
      eyebrow: "Duyên · 偶然促成的相遇",
      title: [
        "越南",
        "河光映照，",
        "朱漆门扉，",
        "屋顶的曲线",
        "宛如涨起的潮水",
      ],
      footnote:
        "沿着香江前行，经过苔色深沉的屋瓦、朱红木门，以及迎着季风翘起的檐角。",
    },
    china: {
      name: "中国",
      eyebrow: "缘分 (Yuánfèn) · 命中注定的相遇",
      title: ["中国", "金色庭院，", "丝路传说，", "飞檐仿佛", "挣脱了重力"],
      footnote:
        "漫步禁苑与彩绘檐廊之间，聆听比那些试图记载它们的地图更古老的故事。",
    },
    japan: {
      name: "日本",
      eyebrow: "間 (Ma) · 让形态显现的停顿",
      title: [
        "日本",
        "雾中的朱檐，",
        "静静延伸的石径，",
        "耐心在这里",
        "化作建筑",
      ],
      footnote:
        "穿过朱红门扉、杉木柱廊与石径，让雨、光影和寂静补全建筑的模样。",
    },
    kazakhstan: {
      name: "哈萨克斯坦",
      eyebrow: "Жол · 道路记得",
      title: [
        "哈萨克斯坦",
        "草原上的风，",
        "圆顶天窗的光，",
        "还有一座",
        "随你而行的家",
      ],
      footnote:
        "穿越无边草原，循着毡与马鬃的纹理，望向那扇将天空框入其中的圆形天窗。",
    },
  },
  ja: {
    vietnam: {
      name: "ベトナム",
      eyebrow: "Duyên · 偶然が結ぶ出会い",
      title: [
        "ベトナム",
        "川面の光、",
        "漆塗りの門、",
        "満ちる潮のように",
        "曲線を描く屋根",
      ],
      footnote:
        "フオン川に沿って、苔で黒ずんだ瓦や朱塗りの木門、季節風に向かって反り上がる軒をたどる。",
    },
    china: {
      name: "中国",
      eyebrow: "缘分 (Yuánfèn) · 運命に導かれる出会い",
      title: [
        "中国",
        "黄金の中庭、",
        "シルクロードの神話、",
        "重力から",
        "解き放たれた屋根",
      ],
      footnote:
        "閉ざされた庭と彩られた軒を巡り、それらを描こうとした地図よりも古い物語に出会う。",
    },
    japan: {
      name: "日本",
      eyebrow: "間 (Ma) · 形を生む、ひと呼吸",
      title: [
        "日本",
        "霧の中の朱い軒、",
        "石畳の道、",
        "忍耐が形をなす",
        "建築",
      ],
      footnote:
        "朱塗りの門、杉の列柱、石畳の道を歩く。雨と影と静けさが、建築を完成させる。",
    },
    kazakhstan: {
      name: "カザフスタン",
      eyebrow: "Жол · 道は記憶する",
      title: [
        "カザフスタン",
        "草原の風、",
        "円い天窓からの光、",
        "あなたとともに",
        "旅する家",
      ],
      footnote:
        "果てしない草原を越え、フェルトと馬の毛の手触りをたどり、空を縁取る円い天窓を見上げる。",
    },
  },
};
