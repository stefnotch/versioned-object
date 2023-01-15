# Versioned Object

Example

```ts
// Make sure to *NEVER* change an existing migration that is used in production. Always add new migrations.
const migrator = Migration.BaseMigration.addMigration(1, (v) => {
  return {
    /** always increment this */
    version: 1,
    bestCat: "unknown",
  };
})
  .addMigration(2, (v) => {
    return {
      version: 2,
      bestCat: v.bestCat === "unknown" ? "Meow" : v.bestCat,
    };
  })
  .build();

migrator.migrateToLatest({ version: 0 });
```
