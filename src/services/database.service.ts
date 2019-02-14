import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private lite: SQLite) {
    // For development only
    /*this.lite.deleteDatabase({
      name: 'mgmt.db',
      location: 'default'
    })
      .then(() => {
        console.log('Database deleted!');
      })
      .catch((err) => {
        console.error('Database could not be deleted');
        console.error(err);
      });*/
  }

  async getDatabase() {
    return this.lite.create({
      name: 'mgmt.db',
      location: 'default'
    });
  }

  async createDatabase() {
    const db = await this.getDatabase();
    
    return await this.createDatabaseTables(db);
  }

  private createDatabaseTables(db: SQLiteObject) {
    return db.sqlBatch([
      'CREATE TABLE IF NOT EXISTS period (id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT NOT NULL, UNIQUE(month));',
      'CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL);',
      'CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY AUTOINCREMENT, id_period INTEGER NOT NULL, id_category INTEGER NOT NULL, name TEXT NOT NULL, value REAL NOT NULL, FOREIGN KEY (id_period) REFERENCES period(id) ON DELETE CASCADE, FOREIGN KEY (id_category) REFERENCES category(id) ON DELETE RESTRICT);',
      'CREATE TABLE IF NOT EXISTS goal (id INTEGER PRIMARY KEY AUTOINCREMENT, id_period INTEGER NOT NULL, id_category INTEGER NOT NULL, current_value REAL NOT NULL, intent_value REAL NOT NULL, FOREIGN KEY (id_period) REFERENCES period(id) ON DELETE CASCADE, FOREIGN KEY (id_category) REFERENCES category(id) ON DELETE RESTRICT);',
      'CREATE TABLE IF NOT EXISTS period_category_expense_intent (id INTEGER PRIMARY KEY AUTOINCREMENT, id_period INTEGER NOT NULL, id_category INTEGER NOT NULL, total REAL NOT NULL, FOREIGN KEY (id_period) REFERENCES period(id) ON DELETE CASCADE, FOREIGN KEY (id_category) REFERENCES category(id) ON DELETE RESTRICT);'
    ]);
  }

  async savePeriod(period: PeriodData) {
    const db = await this.getDatabase();

    return db.transaction((tr) => {
      tr.executeSql(
        'INSERT INTO period (month) VALUES (?);',
        [period.month],
        () => {
          for(let i = 0; i < period.categoriesExpenseIntent.length; i++) {
            tr.executeSql(
              'INSERT INTO period_category_expense_intent (id_period, id_category, total) VALUES ((SELECT MAX(id) FROM period), ?, ?);',
              [period.categoriesExpenseIntent[i].category.id, period.categoriesExpenseIntent[i].total],
              () => { console.log('Period category intent successfully saved!') },
              () => { console.error('Error when insertin period categoryexpense intent') }
            );
          }
        },
        () => { console.error('Error when insertin period') }
      );
    })
  }

  async listPeriods(): Promise<PeriodData[]> {
    const db = await this.getDatabase();
      
    const rs = await db.executeSql('SELECT * FROM period ORDER BY month DESC;', []);

    return new Promise<PeriodData[]>((resolve, reject) => {
      if(rs) {
        let periods = [];

        if (rs.rows.length > 0) {
          for (let i = 0; i < rs.rows.length; i++) {
            this.listPeriodCategoriesExpenseIntent(rs.rows.item(i).id)
              .then((categoriesExpenseIntent: CategoryExpenseIntentData[]) => {
                periods.push({
                  id: rs.rows.item(i).id,
                  month: rs.rows.item(i).month,
                  'categoriesExpenseIntent': categoriesExpenseIntent,
                  expenses: [] // TODO
                });
              });
          }
        }

        resolve(periods);
      } else {
        reject('Unable to load periods');
      }
    });
  }

  async listPeriodCategoriesExpenseIntent(idPeriod: number): Promise<CategoryExpenseIntentData[]> {
    const db = await this.getDatabase();
      
    const rs = await db.executeSql('SELECT pci.* FROM period_category_expense_intent pci INNER JOIN category c ON c.id = pci.id_category WHERE id_period=? ORDER BY c.name;', [idPeriod]);

    return new Promise<CategoryExpenseIntentData[]>((resolve, reject) => {
      if(rs) {
        let categoriesExpenseIntent: CategoryExpenseIntentData[];
        categoriesExpenseIntent = [];

        if(rs.rows.length > 0) {
          for(let i = 0; i < rs.rows.length; i++) {
            this.getCategory(rs.rows.item(i).id_category)
              .then((category: CategoryData) => {
                if(category) {
                  categoriesExpenseIntent.push({
                    id: rs.rows.item(i).id,
                    'category': category,
                    total: rs.rows.item(i).total
                  });
                }
              });
          }
        }

        resolve(categoriesExpenseIntent);
      } else {
        reject('Unable to load the category');
      }
    });
  }

  async deletePeriod(id: number) {
    const db = await this.getDatabase();
    
    await db.executeSql('PRAGMA foreign_keys=ON;', []);

    return db.executeSql('DELETE FROM period WHERE id=?;', [id]);
  }

  async saveCategory(category: CategoryData) {
    const db = await this.getDatabase();

    if(!category.id) {
      return db.executeSql('INSERT INTO category (name, color) VALUES (?, ?);', [category.name, category.color]);
    } else {
      return db.executeSql('UPDATE category SET name=?, color=? WHERE id=?;', [category.name, category.color, category.id]);
    }
  }

  async getCategory(id: number): Promise<CategoryData> {
    const db = await this.getDatabase();

    const rs = await db.executeSql('SELECT * FROM category WHERE id=?;', [id]);

    return new Promise<CategoryData>((resolve, reject) => {
      if(rs) {
        if(rs.rows.length > 0) {
          resolve(rs.rows.item(0));
        } else {
          resolve(null);
        }
      } else {
        reject('Unable to load the category');
      }
    });
  }

  async listCategories(): Promise<CategoryData[]> {
    const db = await this.getDatabase();
      
    const rs = await db.executeSql('SELECT * FROM category ORDER BY name;', []);

    return new Promise<CategoryData[]>((resolve, reject) => {
      if(rs) {
        let categories: CategoryData[];

        categories = [];

        if(rs.rows.length > 0) {
          for(let i = 0; i < rs.rows.length; i++) {
            categories.push(rs.rows.item(i));
          }
        }

        resolve(categories);
      } else {
        reject('Invalid resultset');
      }
    });
  }

  async deleteCategory(id: number) {
    const db = await this.getDatabase();
    
    await db.executeSql('PRAGMA foreign_keys=ON;', []);
    
    return db.executeSql('DELETE FROM category WHERE id=?;', [id]);
  }

  async saveExpense(expense: ExpenseData) {
    const db = await this.getDatabase();

    if(!expense.id) {
      return db.executeSql('INSERT INTO expense (name, value, id_period, id_category) VALUES (?, ?, ?, ?);', [expense.name, expense.value, expense.idPeriod, expense.idCategory]);
    } else {
      return db.executeSql('UPDATE expense SET name=?, value=?, id_category=? WHERE id=?;', [expense.name, expense.value, expense.idCategory, expense.id]);
    }
  }

  async deleteExpense(id: number) {
    const db = await this.getDatabase();
      
    return db.executeSql('DELETE FROM expense WHERE id=?;', [id]);
  }
}

export interface PeriodData {
  id: number;
  month: string;
  categoriesExpenseIntent: CategoryExpenseIntentData[];
  expenses: ExpenseData[];
}

export interface CategoryExpenseIntentData {
  id: number;
  total: number;
  category: CategoryData;
}

export interface CategoryData {
  id: number;
  name: string;
  color: string;
}

export interface ExpenseData {
  id: number;
  name: string;
  value: number;
  idPeriod: number;
  idCategory: number;
}

export interface GoalData {
  id: number;
  currentValue: number;
  intentValue: number;
  category: CategoryData;
}