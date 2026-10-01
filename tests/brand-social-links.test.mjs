import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// Resolve the application's alias while keeping these tests independent of Next.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  }
});

const { defaultBrandFor, VIGILUS_SOCIAL_LINKS } = await import("../src/lib/brands.ts");
const { getBrandConfig, saveBrandConfig } = await import("../src/lib/db.ts");

test("legacy brand links inherit defaults while an explicitly empty list stays hidden after saving", async () => {
  const originalMode = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  const previousSql = globalThis.vigilusSql;
  const previousSchema = globalThis.vigilusSchemaPromise;
  const row = {
    subsidiary: "Vigilus Sénégal",
    primary_color: "#13a3e3",
    accent_color: "#c30c29",
    logo_url: null,
    social_links: null
  };
  globalThis.vigilusSchemaPromise = Promise.resolve();
  globalThis.vigilusSql = {
    query: async (sql, params) => {
      if (sql.startsWith("SELECT * FROM brand_configs")) return [{ ...row }];
      assert.ok(sql.startsWith("INSERT INTO brand_configs"));
      assert.match(sql, /social_links=EXCLUDED\.social_links/);
      row.social_links = params[4];
      return [];
    }
  };

  try {
    const inherited = await getBrandConfig(row.subsidiary);
    assert.deepEqual(inherited.socialLinks, VIGILUS_SOCIAL_LINKS);

    await saveBrandConfig({ ...inherited, socialLinks: [] });
    assert.deepEqual((await getBrandConfig(row.subsidiary)).socialLinks, []);

    const customized = [{ label: "LinkedIn", url: "https://www.linkedin.com/company/example" }];
    await saveBrandConfig({ ...inherited, socialLinks: customized });
    assert.deepEqual((await getBrandConfig(row.subsidiary)).socialLinks, customized);
  } finally {
    globalThis.vigilusSql = previousSql;
    globalThis.vigilusSchemaPromise = previousSchema;
    if (originalMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalMode;
  }
});

test("an unknown company never inherits Vigilus social accounts", () => {
  assert.equal(defaultBrandFor("Une autre entreprise").socialLinks, undefined);
});
