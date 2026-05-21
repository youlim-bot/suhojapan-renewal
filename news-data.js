/**
 * ======================================================
 *  SUHO ニュース管理ファイル — news-data.js
 * ======================================================
 *
 * ■ 新しい記事を追加する方法：
 *   1. NEWS_DATA 配列の先頭（最初の { の直前）に新しいオブジェクトを追加します
 *   2. id は既存の最大値 + 1 にしてください
 *   3. ファイルを保存するだけでニュースページに自動反映されます
 *
 * ■ 各フィールドの説明：
 *   id       : 一意の番号（重複不可）
 *   title    : 記事タイトル
 *   category : "corporate" | "service" | "partnership" | "event"  ← 下記カテゴリ一覧参照
 *   date     : "YYYY.MM.DD" 形式
 *   excerpt  : 一覧に表示する概要文（1〜2文程度）
 *   link     : 詳細ページURL（外部リンクは https:// から。なければ "#"）
 *   emoji    : サムネイルアイコン（省略時は "📰"）
 *   featured : true にするとページ最上部にフィーチャー表示（最新の true が1件のみ有効）
 *
 * ■ カテゴリ一覧：
 *   "corporate"   → コーポレート（会社全般のお知らせ）
 *   "service"     → サービス（サービス開始・キャンペーン）
 *   "partnership" → パートナーシップ（業務提携・パートナー契約）
 *   "event"       → イベント（展示会・セミナー・交流会）
 * ======================================================
 */

const NEWS_DATA = [

  // ===== 新しい記事はここより下に追加してください（新しいものが上） =====

  {
    id: 20,
    title: "韓国の非可視性ウォーターマーク先導企業「スナップタグ」と戦略的提携",
    category: "partnership",
    date: "2025.08.04",
    excerpt: "韓国の非可視性ウォーターマーク技術を持つスナップタグ社との戦略的提携を発表しました。デジタルコンテンツ保護と権利管理の強化を推進してまいります。",
    link: "#",
    emoji: "🤝",
    featured: true
  },
  {
    id: 19,
    title: "韓国ネイバークラウドMSPシルバーランク達成記念割引プロモーション開催",
    category: "corporate",
    date: "2025.04.22",
    excerpt: "ネイバークラウドMSPシルバーランク達成を記念した特別割引プロモーションを実施いたします。",
    link: "#",
    emoji: "🏅"
  },
  {
    id: 18,
    title: "2025年度のゲーム事業計画を発表",
    category: "corporate",
    date: "2025.01.20",
    excerpt: "2025年度における当社ゲーム事業の新たな方向性と計画についてご報告いたします。",
    link: "#",
    emoji: "🎮"
  },
  {
    id: 17,
    title: "新たな収益創出への踏み出し『海外進出お任せサービス』をご紹介",
    category: "service",
    date: "2024.04.10",
    excerpt: "海外市場への進出を全面的にサポートする新サービス『海外進出お任せサービス』を開始いたします。",
    link: "#",
    emoji: "🌏"
  },
  {
    id: 16,
    title: "『High Run＆Wide Run』ゲーム開発・運営サービスをご紹介",
    category: "service",
    date: "2024.02.28",
    excerpt: "モバイルゲーム開発から運営まで一括サポートする新サービスをリリースしました。",
    link: "#",
    emoji: "🕹️"
  },
  {
    id: 15,
    title: "豊富な経験と実績で、お客様の課題解決を支援するサービス",
    category: "service",
    date: "2024.02.22",
    excerpt: "長年の実績と専門知識を活かし、お客様のビジネス課題を総合的に解決するサービスのご紹介です。",
    link: "#",
    emoji: "💡"
  },
  {
    id: 14,
    title: "Webサイト脆弱性診断サービスが完全無料！ Webサイトの攻撃遮断サービス",
    category: "service",
    date: "2020.09.08",
    excerpt: "Webサイトの脆弱性診断を無償で提供するキャンペーンを実施。サイバー攻撃からWebサイトを守ります。",
    link: "#",
    emoji: "🛡️"
  },
  {
    id: 13,
    title: "株式会社スホ、韓国ネイバービジネスプラットフォームとパートナー契約を締結",
    category: "partnership",
    date: "2020.07.30",
    excerpt: "韓国最大規模のITプラットフォーム企業、ネイバービジネスプラットフォームとの正式パートナー契約を締結しました。",
    link: "#",
    emoji: "🤝"
  },
  {
    id: 12,
    title: "Cloud WAFサービスFortifyの無償提供キャンペーン",
    category: "service",
    date: "2020.06.04",
    excerpt: "クラウド型WAFサービス「Fortify」の無償提供キャンペーンを期間限定で実施いたします。",
    link: "#",
    emoji: "🛡️"
  },
  {
    id: 11,
    title: "Whatap ITモニタリングサービスを開始",
    category: "service",
    date: "2019.11.01",
    excerpt: "システムの状態をリアルタイムで可視化するITモニタリングサービス「Whatap」の提供を開始しました。",
    link: "#",
    emoji: "📊"
  },
  {
    id: 10,
    title: "WAF(Web Application Firewall)サービス - Fortifyのキャンペーン",
    category: "service",
    date: "2017.10.04",
    excerpt: "WebアプリケーションをサイバーアタックからWAFサービス「Fortify」で守るキャンペーンのご案内です。",
    link: "#",
    emoji: "🔒"
  },
  {
    id: 9,
    title: "日韓デジタルコンテンツ協会が東京ゲームショウに参加！",
    category: "event",
    date: "2016.09.16",
    excerpt: "日韓デジタルコンテンツ協会の一員として東京ゲームショウへの出展が決定しました。",
    link: "#",
    emoji: "🎯"
  },
  {
    id: 8,
    title: "WAF(Web Application Firewall)サービスの開始",
    category: "service",
    date: "2017.09.20",
    excerpt: "Webアプリケーションへの不正アクセスや攻撃を遮断するWAFサービスの提供を正式開始いたします。",
    link: "#",
    emoji: "🔒"
  },
  {
    id: 7,
    title: "株式会社スホがSDNプラットフォーム供給企業Aryakaとパートナー契約を締結",
    category: "partnership",
    date: "2016.10.27",
    excerpt: "グローバルSDNプラットフォームのリーダー企業Aryakaとの正式パートナーシップを締結しました。",
    link: "#",
    emoji: "🌐"
  },
  {
    id: 6,
    title: "東京ゲームショウ2017「GYRO VR」展示のご報告",
    category: "event",
    date: "2017.09.25",
    excerpt: "東京ゲームショウ2017にてVRコンテンツ「GYRO VR」を出展いたしました。多くのご来場、誠にありがとうございました。",
    link: "#",
    emoji: "🥽"
  },
  {
    id: 5,
    title: "株式会社スホVRホスティング提供に伴い、株式会社ＪＡＭＯＮＧとパートナー契約を締結",
    category: "partnership",
    date: "2016.09.01",
    excerpt: "VRコンテンツホスティングサービスの開始にあたり、株式会社ＪＡＭＯＮＧとのパートナー契約を締結しました。",
    link: "#",
    emoji: "🤝"
  },
  {
    id: 4,
    title: "日韓ゲーム業界交流会のご報告",
    category: "event",
    date: "2016.07.22",
    excerpt: "日韓のゲーム業界関係者が集う交流会を開催しました。多数のご参加をいただき盛況のうちに終了いたしました。",
    link: "#",
    emoji: "🎮"
  },
  {
    id: 3,
    title: "SUHOホスティングパックサービス",
    category: "service",
    date: "2016.07.13",
    excerpt: "中小企業向けに最適化した、コストパフォーマンスの高いホスティングパックサービスの提供を開始しました。",
    link: "#",
    emoji: "☁️"
  },
  {
    id: 2,
    title: "AWS（アマゾンウェブサービス）セミナー開催報告",
    category: "event",
    date: "2016.05.19",
    excerpt: "AWSの活用方法をテーマに開催したセミナーには多くの企業様にご参加いただきました。",
    link: "#",
    emoji: "📚"
  },
  {
    id: 1,
    title: "業界最安値のＡＷＳパッケージプランをスタート！",
    category: "service",
    date: "2016.05.25",
    excerpt: "業界最安値を実現したAWSパッケージプランの提供を開始いたします。クラウド導入のコストを大幅に削減できます。",
    link: "#",
    emoji: "☁️"
  }

];
