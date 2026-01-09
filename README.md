# 同窓会 出欠確認サイト

2026年5月3日開催の同窓会の出欠確認を行うウェブサイトです。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Neon PostgreSQL
- **ORM**: Prisma
- **デプロイ**: Vercel

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Neonデータベースの作成

1. [Neon](https://neon.tech/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. Connection Stringをコピー

### 3. 環境変数の設定

`.env`ファイルを作成し、Neonの接続情報を設定します:

```bash
cp .env.example .env
```

`.env`ファイルを編集し、`DATABASE_URL`にNeonのConnection Stringを設定:

```
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### 4. Prismaのセットアップとマイグレーション

```bash
# Prisma Clientの生成
npx prisma generate

# データベースにテーブルを作成
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## Vercelへのデプロイ

### 1. Vercelアカウントの準備

[Vercel](https://vercel.com/)でアカウントを作成し、GitHubと連携します。

### 2. プロジェクトのデプロイ

```bash
# Vercel CLIをインストール(初回のみ)
npm i -g vercel

# デプロイ
vercel
```

または、VercelのダッシュボードからGitHubリポジトリをインポートしてデプロイできます。

### 3. 環境変数の設定

Vercelのプロジェクト設定で、以下の環境変数を設定します:

- `DATABASE_URL`: NeonのConnection String

### 4. デプロイ後の確認

デプロイが完了すると、VercelからURLが発行されます。
そのURLにアクセスして動作を確認してください。

## データベースの確認

Prisma Studioを使用して、データベースの内容を確認できます:

```bash
npx prisma studio
```

ブラウザで [http://localhost:5555](http://localhost:5555) が開き、
データベースの内容をGUIで確認・編集できます。

## フォーム項目

- **姓** (必須)
- **名** (必須)
- **旧姓** (任意)
- **組** (必須): 1組、2組、3組、4組、不明
- **出欠** (必須): 出席する、出席しない、その他
  - その他を選択した場合は詳細入力(必須)
- **アレルギー有無** (必須): 無し、有り
  - 有りの場合は詳細入力(任意)
- **備考欄** (任意)

## ライセンス

MIT
