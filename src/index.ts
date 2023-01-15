/**
 * Every object that is versioned should implement this interface
 */
export interface VersionedObject<Version extends number> {
  readonly version: Version;
}

/**
 * Helper class purely for getting that cute fluent interface for adding migrations
 *
 */
export class Migration<FinalVersionedObject extends VersionedObject<number>> {
  readonly previousMigration: Migration<VersionedObject<any>> | null;
  readonly targetVersion: number;
  readonly migrate: (value: VersionedObject<any>) => FinalVersionedObject;

  private constructor(
    previousMigration: Migration<VersionedObject<any>> | null,
    targetVersion: number,
    migrate: (db: VersionedObject<any>) => FinalVersionedObject
  ) {
    this.previousMigration = previousMigration;
    this.targetVersion = targetVersion;
    this.migrate = migrate;
  }

  static BaseMigration = new Migration(null, 1, () => {
    return {
      version: 0,
    };
  });

  addMigration<V extends number, U extends VersionedObject<V>>(
    targetVersion: V,
    migrate: (db: ReturnType<this["migrate"]>) => U
  ): Migration<U> {
    return new Migration(this, targetVersion, migrate as any);
  }

  build(): VersionMigrator<FinalVersionedObject> {
    return new VersionMigrator<FinalVersionedObject>(this);
  }
}

/**
 * This class is responsible for migrating the object to the latest version
 */
export class VersionMigrator<
  FinalVersionedObject extends VersionedObject<number>
> {
  private readonly finalMigration: Migration<FinalVersionedObject>;

  constructor(finalMigration: Migration<FinalVersionedObject>) {
    this.finalMigration = finalMigration;
  }

  migrateToLatest(value: VersionedObject<number>): FinalVersionedObject {
    let currentMigration: Migration<any> | null = this.finalMigration;
    const upgrades: Migration<any>[] = [];

    while (
      currentMigration !== null &&
      currentMigration.targetVersion > value.version
    ) {
      upgrades.push(currentMigration);
      currentMigration = currentMigration.previousMigration;
    }
    upgrades.reverse();
    upgrades.forEach((migration) => {
      value = migration.migrate(value);
    });

    return value as any;
  }
}
