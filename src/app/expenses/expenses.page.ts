import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { PeriodModalComponent } from './period-modal/period-modal.component';
import { PeriodData, DatabaseService, CategoryExpenseIntentData, ExpenseData } from 'src/services/database.service';
import { ExpenseModalComponent } from './expense-modal/expense-modal.component';
import { PeriodExpensesModalComponent } from './period-expenses-modal/period-expenses-modal.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {

  public periods: PeriodData[];

  constructor(private db: DatabaseService, private modalCtrl: ModalController, private toastCtrl: ToastController) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.updatePeriodList();
  }

  async presentPeriodModal(period: PeriodData) {
    const modal = await this.modalCtrl.create({
      component: PeriodModalComponent,
      componentProps: {
        'title': period ? 'Edit period' : 'New period',
        'period': period
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.db.savePeriod(data)
        .then(() => {
          console.log('Period successfully saved');

          this.displaySuccess('Period saved');

          this.updatePeriodList();
        })
        .catch((err) => {
          console.error('Unable to save the period');
          console.error(err);

          this.displayError('Period already exists');
        });
    }
  }

  deletePeriod(id: number) {
    this.db.deletePeriod(id)
      .then(() => {
        console.log('Period deleted');

        this.displaySuccess('Period deleted');

        this.updatePeriodList();
      })
      .catch((err) => {
        console.error('Period could not be deleted');
        console.error(err);
      });
  }

  async updatePeriodList() {
    this.db.listPeriods()
      .then((periods: PeriodData[]) => {
        this.periods = periods;
      })
      .catch((err) => {
        console.error('Unable to load update the period list!');
      });
  }

  async presentExpenseModal(expense: ExpenseData) {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        'title': expense ? 'Edit expense' : 'New expense',
        'expense': expense
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.db.saveExpense(data)
        .then(() => {
          console.log('Expense successfully saved');

          this.displaySuccess('Expense saved');

          this.updatePeriodList();
        })
        .catch((err) => {
          console.error('Unable to save the expense');
          console.error(err);

          this.displayError('Unable to save the expense');
        });
    }
  }

  async presentPeriodExpensesModal(period: PeriodData) {
    const modal = await this.modalCtrl.create({
      component: PeriodExpensesModalComponent,
      componentProps: {
        'title': period.month,
        'expenses': period.expenses
      }
    });

    await modal.present();

    await modal.onDidDismiss();

    this.updatePeriodList();
  }

  async displaySuccess(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });

    toast.present();
  }

  async displayError(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });

    toast.present();
  }
}