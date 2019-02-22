import { Component, OnInit, Input } from '@angular/core';
import { ExpenseData, DatabaseService } from 'src/services/database.service';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-period-expenses-modal',
  templateUrl: './period-expenses-modal.component.html',
  styleUrls: ['./period-expenses-modal.component.scss']
})
export class PeriodExpensesModalComponent implements OnInit {

  @Input() title: string;
  @Input() expenses: ExpenseData[];

  constructor(private db: DatabaseService, private modalCtrl: ModalController, private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  deleteExpense(id: number) {
    this.db.deleteExpense(id)
      .then(() => {
        this.expenses = this.expenses.filter(expense => expense.id != id);

        this.displaySuccess('Expense deleted');
      })
      .catch((err) => {
        this.displayError('Can\'t delete the expense');
        console.error('Can\'t delete the expense');
        console.error(err);
      })
  }

  dismissModal() {
    this.modalCtrl.dismiss();
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
