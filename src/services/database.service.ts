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
      'CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY AUTOINCREMENT, id_period INTEGER NOT NULL, id_category INTEGER NOT NULL, name TEXT NOT NULL, value REAL NOT NULL, datetime TEXT NOT NULL, FOREIGN KEY (id_period) REFERENCES period(id) ON DELETE CASCADE, FOREIGN KEY (id_category) REFERENCES category(id) ON DELETE RESTRICT);',
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
                this.listPeriodExpenses(rs.rows.item(i).id)
                  .then((expenses: ExpenseData[]) => {
                    periods.push({
                      id: rs.rows.item(i).id,
                      month: rs.rows.item(i).month,
                      'categoriesExpenseIntent': categoriesExpenseIntent,
                      'expenses': expenses
                    });
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
                  this.listPeriodCategoryExpenses(idPeriod, category.id)
                    .then((amount: number) => {
                      amount = amount ? amount : 0;

                      categoriesExpenseIntent.push({
                        id: rs.rows.item(i).id,
                        'category': category,
                        total: rs.rows.item(i).total,
                        current: amount
                      });
                    })
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

  async listPeriodCategoryExpenses(idPeriod: number, idCategory: number): Promise<number> {
    const db = await this.getDatabase();
      
    const rs = await db.executeSql('SELECT SUM(e.value) as current FROM expense e INNER JOIN category c ON c.id = e.id_category INNER JOIN period p ON p.id = e.id_period WHERE e.id_period=? AND e.id_category=?;', [idPeriod, idCategory]);

    return new Promise<number>((resolve, reject) => {
      if(rs && rs.rows.length > 0) {
        resolve(rs.rows.item(0).current);
      } else {
        reject('Unable to get current expenses');
      }
    });
  }

  async listPeriodExpenses(idPeriod: number): Promise<ExpenseData[]> {
    const db = await this.getDatabase();
      
    const rs = await db.executeSql('SELECT e.* FROM expense e INNER JOIN period p ON p.id = e.id_period WHERE e.id_period=? ORDER BY e.datetime DESC;', [idPeriod]);

    return new Promise<ExpenseData[]>((resolve, reject) => {
      if(rs) {
        let expenses: ExpenseData[];
        expenses = [];

        if(rs.rows.length > 0) {
          for(let i = 0; i < rs.rows.length; i++) {
            let expense: ExpenseData;
            let rawExpense = rs.rows.item(i);
            
            this.getCategory(rawExpense.id_category)
              .then((category: CategoryData) => {
                expense = {
                  id: rawExpense.id,
                  name: rawExpense.name,
                  value: rawExpense.value,
                  datetime: rawExpense.datetime,
                  'category': category,
                  idPeriod: rawExpense.id_period,
                  idCategory: rawExpense.id_category
                };

                expenses.push(expense);
              });
          }
        }

        resolve(expenses);
      } else {
        reject('Unable to load the period expenses');
      }
    });
  }

  async deletePeriod(id: number) {
    return this.secureDeleteById('period', id);
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
    return this.secureDeleteById('category', id);
  }

  async saveExpense(expense: ExpenseData) {
    const db = await this.getDatabase();

    if(!expense.id) {
      return db.executeSql('INSERT INTO expense (name, value, datetime, id_period, id_category) VALUES (?, ?, ?, ?, ?);', [expense.name, expense.value, expense.datetime, expense.idPeriod, expense.idCategory]);
    } else {
      return db.executeSql('UPDATE expense SET name=?, value=?, id_category=? WHERE id=?;', [expense.name, expense.value, expense.idCategory, expense.id]);
    }
  }

  async deleteExpense(id: number) {
    return this.secureDeleteById('expense', id);
  }

  private async secureDeleteById(table: string, id: number) {
    const db = await this.getDatabase();
    
    await db.executeSql('PRAGMA foreign_keys=ON;', []);
    
    let query = 'DELETE FROM ' + table + ' WHERE id=?;'

    console.log(query);

    return db.executeSql(query, [id]);
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
  current: number;
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
  datetime: string;
  idPeriod: number;
  idCategory: number;
  category: CategoryData;
}

export interface GoalData {
  id: number;
  currentValue: number;
  intentValue: number;
  category: CategoryData;
}