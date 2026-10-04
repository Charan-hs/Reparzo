import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SUBCATEGORIES, 
  INITIAL_SERVICES 
} from '../../website/src/store/useAppStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(backendDir, '..');
const websitePublicDir = path.resolve(rootDir, 'website', 'public');
const sqlOutFile = path.resolve(backendDir, 'seeds', 'seed_catalog.sql');

function escapeSql(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'ac-services': '/banners/ac-service.jpg',
  'bike-service': '/banners/bike-service.jpg',
  'home-shifting': '/banners/home-shifting.jpg',
  'electrical-services': '/banners/electrical-service.jpg',
  'plumbing-services': '/banners/plumbing-service.jpg',
  'refrigerator-services': '/banners/refrigerator-service.jpg',
  'washing-machine-services': '/banners/washing-machine-service.jpg',
  'water-tank-services': '/banners/water-tank-service.jpg',
};

function generateCatalogSql(): string {
  const lines: string[] = [
    '-- ==========================================================================',
    '-- REPARZO CATALOG SEED SCRIPT (Categories, Subcategories, Services)',
    `-- Generated: ${new Date().toISOString()}`,
    '-- Source: website/src/store/useAppStore.ts',
    '-- ==========================================================================',
    '',
    '-- 1. POPULATE CATEGORIES',
  ];

  for (const cat of INITIAL_CATEGORIES) {
    const catImage = (cat as any).image || DEFAULT_CATEGORY_IMAGES[cat.slug] || '/banners/ac-service.jpg';
    lines.push(
      `INSERT INTO categories (id, slug, title, icon_name, description, badge, bg_gradient, image, is_active, display_order, created_at, updated_at) VALUES (` +
      `${escapeSql(cat.id)}, ` +
      `${escapeSql(cat.slug)}, ` +
      `${escapeSql(cat.title)}, ` +
      `${escapeSql(cat.iconName || 'Wrench')}, ` +
      `${escapeSql(cat.description)}, ` +
      `${escapeSql(cat.badge)}, ` +
      `${escapeSql(cat.bgGradient || 'from-blue-600 to-cyan-500')}, ` +
      `${escapeSql(catImage)}, ` +
      `${cat.isActive ? 1 : 0}, ` +
      `${cat.order || 0}, ` +
      `strftime('%s', 'now'), ` +
      `strftime('%s', 'now')` +
      `) ON CONFLICT(id) DO UPDATE SET ` +
      `slug = excluded.slug, ` +
      `title = excluded.title, ` +
      `icon_name = excluded.icon_name, ` +
      `description = excluded.description, ` +
      `badge = excluded.badge, ` +
      `bg_gradient = excluded.bg_gradient, ` +
      `image = excluded.image, ` +
      `is_active = excluded.is_active, ` +
      `display_order = excluded.display_order, ` +
      `updated_at = strftime('%s', 'now');`
    );
  }

  lines.push('', '-- 2. POPULATE SUBCATEGORIES');

  for (const sub of INITIAL_SUBCATEGORIES) {
    const subImage = (sub as any).image || DEFAULT_CATEGORY_IMAGES[sub.categorySlug] || '/banners/ac-service.jpg';
    lines.push(
      `INSERT INTO sub_categories (id, category_id, category_slug, title, slug, icon_name, description, badge, starting_price, original_price, duration_minutes, warranty_days, image, is_active, display_order, features, created_at, updated_at) VALUES (` +
      `${escapeSql(sub.id)}, ` +
      `${escapeSql(sub.categoryId)}, ` +
      `${escapeSql(sub.categorySlug)}, ` +
      `${escapeSql(sub.title)}, ` +
      `${escapeSql(sub.slug)}, ` +
      `${escapeSql(sub.iconName)}, ` +
      `${escapeSql(sub.description)}, ` +
      `${escapeSql(sub.badge)}, ` +
      `${escapeSql(sub.startingPrice)}, ` +
      `${escapeSql(sub.originalPrice)}, ` +
      `${escapeSql(sub.durationMinutes || 45)}, ` +
      `${escapeSql(sub.warrantyDays || 30)}, ` +
      `${escapeSql(subImage)}, ` +
      `${sub.isActive ? 1 : 0}, ` +
      `${sub.order || 0}, ` +
      `${escapeSql(sub.features || [])}, ` +
      `strftime('%s', 'now'), ` +
      `strftime('%s', 'now')` +
      `) ON CONFLICT(id) DO UPDATE SET ` +
      `category_id = excluded.category_id, ` +
      `category_slug = excluded.category_slug, ` +
      `title = excluded.title, ` +
      `slug = excluded.slug, ` +
      `icon_name = excluded.icon_name, ` +
      `description = excluded.description, ` +
      `badge = excluded.badge, ` +
      `starting_price = excluded.starting_price, ` +
      `original_price = excluded.original_price, ` +
      `duration_minutes = excluded.duration_minutes, ` +
      `warranty_days = excluded.warranty_days, ` +
      `image = excluded.image, ` +
      `is_active = excluded.is_active, ` +
      `display_order = excluded.display_order, ` +
      `features = excluded.features, ` +
      `updated_at = strftime('%s', 'now');`
    );
  }

  lines.push('', '-- 3. POPULATE SERVICES');

  for (const srv of INITIAL_SERVICES) {
    // Match category and subcategory
    const cat = INITIAL_CATEGORIES.find((c) => c.slug === srv.categorySlug);
    const sub = INITIAL_SUBCATEGORIES.find((s) => s.slug === srv.subCategorySlug);

    const icon = sub?.iconName || cat?.iconName || 'Wrench';
    const catId = cat?.id || null;
    const subId = sub?.id || null;

    lines.push(
      `INSERT INTO services (id, slug, title, description, category, category_id, category_slug, category_title, sub_category_id, sub_category_slug, sub_category_title, price_estimated, original_price, duration_minutes, icon, rating, reviews_count, inclusions, warranty_days, image, is_popular, is_active, metadata, created_at, updated_at) VALUES (` +
      `${escapeSql(srv.id)}, ` +
      `${escapeSql(srv.slug)}, ` +
      `${escapeSql(srv.title)}, ` +
      `${escapeSql(srv.description)}, ` +
      `${escapeSql(srv.categoryTitle || srv.categorySlug)}, ` +
      `${escapeSql(catId)}, ` +
      `${escapeSql(srv.categorySlug)}, ` +
      `${escapeSql(srv.categoryTitle)}, ` +
      `${escapeSql(subId)}, ` +
      `${escapeSql(srv.subCategorySlug)}, ` +
      `${escapeSql(srv.subCategoryTitle)}, ` +
      `${escapeSql(srv.price)}, ` +
      `${escapeSql(srv.originalPrice)}, ` +
      `${escapeSql(srv.durationMinutes || 60)}, ` +
      `${escapeSql(icon)}, ` +
      `${escapeSql(srv.rating || 4.9)}, ` +
      `${escapeSql(srv.reviewsCount || 0)}, ` +
      `${escapeSql(srv.inclusions || [])}, ` +
      `${escapeSql(srv.warrantyDays || 30)}, ` +
      `${escapeSql(srv.image)}, ` +
      `${srv.isPopular ? 1 : 0}, ` +
      `1, ` +
      `${escapeSql({})}, ` +
      `strftime('%s', 'now'), ` +
      `strftime('%s', 'now')` +
      `) ON CONFLICT(id) DO UPDATE SET ` +
      `slug = excluded.slug, ` +
      `title = excluded.title, ` +
      `description = excluded.description, ` +
      `category = excluded.category, ` +
      `category_id = excluded.category_id, ` +
      `category_slug = excluded.category_slug, ` +
      `category_title = excluded.category_title, ` +
      `sub_category_id = excluded.sub_category_id, ` +
      `sub_category_slug = excluded.sub_category_slug, ` +
      `sub_category_title = excluded.sub_category_title, ` +
      `price_estimated = excluded.price_estimated, ` +
      `original_price = excluded.original_price, ` +
      `duration_minutes = excluded.duration_minutes, ` +
      `icon = excluded.icon, ` +
      `rating = excluded.rating, ` +
      `reviews_count = excluded.reviews_count, ` +
      `inclusions = excluded.inclusions, ` +
      `warranty_days = excluded.warranty_days, ` +
      `image = excluded.image, ` +
      `is_popular = excluded.is_popular, ` +
      `is_active = excluded.is_active, ` +
      `updated_at = strftime('%s', 'now');`
    );
  }

  lines.push('');
  return lines.join('\n');
}

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

interface ImageAsset {
  relKey: string;
  absPath: string;
  mime: string;
}

function discoverImages(): ImageAsset[] {
  const assets: ImageAsset[] = [];

  function walk(dir: string, baseDir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full, baseDir);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (MIME_MAP[ext]) {
          const rel = path.relative(baseDir, full).replace(/\\/g, '/');
          assets.push({
            relKey: rel,
            absPath: full,
            mime: MIME_MAP[ext],
          });
        }
      }
    }
  }

  // 1. Walk website/public/banners
  walk(path.join(websitePublicDir, 'banners'), websitePublicDir);
  // 2. Also check website/public root images (logo, favicon, apple-touch-icon)
  const rootFiles = ['logo.png', 'favicon.png', 'apple-touch-icon.png'];
  for (const rf of rootFiles) {
    const full = path.join(websitePublicDir, rf);
    if (fs.existsSync(full)) {
      const ext = path.extname(rf).toLowerCase();
      assets.push({
        relKey: rf,
        absPath: full,
        mime: MIME_MAP[ext] || 'image/png',
      });
    }
  }

  return assets;
}

function runWithRetry(cmd: string, maxRetries = 3, delayMs = 1500): string {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return execSync(cmd, { cwd: backendDir, env: { ...process.env, CI: 'true' }, stdio: 'pipe' }).toString();
    } catch (err: unknown) {
      lastErr = err;
      if (attempt < maxRetries) {
        console.log(`     ⚠️ Transient error on attempt ${attempt}. Retrying in ${delayMs}ms...`);
        execSync(`sleep ${delayMs / 1000}`);
      }
    }
  }
  throw lastErr;
}

async function uploadImagesToMediaStorage(target: 'remote' | 'local' | 'both') {
  const images = discoverImages();
  console.log(`\n📸 Discovered ${images.length} images to sync with Media Storage:`);
  for (const img of images) {
    console.log(`  • ${img.relKey} (${img.mime})`);
  }

  const targets = target === 'both' ? ['remote', 'local'] : [target];

  for (const tgt of targets) {
    console.log(`\n🚀 Uploading images to Media Storage [${tgt.toUpperCase()}] (bucket: reparzo-media)...`);
    for (const img of images) {
      try {
        const flag = tgt === 'remote' ? '--remote' : '--local';
        const cmd = `npx wrangler r2 object put "reparzo-media/${img.relKey}" --file="${img.absPath}" --content-type="${img.mime}" ${flag}`;
        runWithRetry(cmd, 3, 1000);
        console.log(`  ✅ [${tgt}] Uploaded: reparzo-media/${img.relKey}`);
      } catch (err: unknown) {
        console.error(`  ❌ [${tgt}] Failed uploading ${img.relKey}:`, err instanceof Error ? err.message : String(err));
      }
    }
  }
}

async function populateDatabases(target: 'remote' | 'local' | 'both') {
  console.log(`\n📄 Generating SQL seed script: ${sqlOutFile}`);
  const sql = generateCatalogSql();
  fs.writeFileSync(sqlOutFile, sql, 'utf-8');
  console.log(`  ✅ Generated ${sql.split('\n').length} lines of SQL containing:`);
  console.log(`     • ${INITIAL_CATEGORIES.length} Categories`);
  console.log(`     • ${INITIAL_SUBCATEGORIES.length} Subcategories`);
  console.log(`     • ${INITIAL_SERVICES.length} Services`);

  const targets = target === 'both' ? ['local', 'remote'] : [target];

  for (const tgt of targets) {
    console.log(`\n🗄️  Executing seed on Database [${tgt.toUpperCase()}] (database: reparzo-db)...`);
    try {
      const flag = tgt === 'remote' ? '--remote' : '--local';
      const cmd = `CI=true npx wrangler d1 execute reparzo-db ${flag} --file="seeds/seed_catalog.sql"`;
      const output = runWithRetry(cmd, 3, 2000);
      console.log(`  ✅ [${tgt}] Catalog database populated successfully!`);
      const lines = output.trim().split('\n');
      console.log(`     ${lines[lines.length - 1] || 'Success'}`);
    } catch (err: unknown) {
      console.error(`  ❌ [${tgt}] Database execution failed:`, err instanceof Error ? err.message : String(err));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isImagesOnly = args.includes('--images-only');
  const isDbOnly = args.includes('--db-only');
  const isRemoteOnly = args.includes('--remote');
  const isLocalOnly = args.includes('--local');

  const targetEnv: 'remote' | 'local' | 'both' = isRemoteOnly 
    ? 'remote' 
    : isLocalOnly 
      ? 'local' 
      : 'both';

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         REPARZO CATALOG & MEDIA SEED ENGINE               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`Environment Target: ${targetEnv.toUpperCase()}`);

  if (!isImagesOnly) {
    await populateDatabases(targetEnv);
  }

  if (!isDbOnly) {
    await uploadImagesToMediaStorage(targetEnv);
  }

  console.log('\n🎉 ALL CATALOG DATA & MEDIA SYNCHRONIZATION COMPLETE!\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error during population:', err);
  process.exit(1);
});
