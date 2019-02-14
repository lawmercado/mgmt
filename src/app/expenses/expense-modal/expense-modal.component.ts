import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService, PeriodData, CategoryData, ExpenseData } from 'src/services/database.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.scss']
})
export class ExpenseModalComponent implements OnInit {

  @Input() title: string;
  @Input() expense: ExpenseData;

  private expenseForm: FormGroup;

  public periods: PeriodData[];

  public categories: CategoryData[];

  constructor(private db: DatabaseService, private formBuilder: FormBuilder, private modalCtrl: ModalController) {
    this.expenseForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      idPeriod: ['', Validators.required],
      idCategory: ['', Validators.required],
      value: ['', Validators.required]
    });

    this.periods = [];
    this.db.listPeriods().then((periods: PeriodData[]) => {
      this.periods = periods;
    })

    this.categories = [];
    this.db.listCategories().then((categories: CategoryData[]) => {
      this.categories = categories;
    })
  }

  ngOnInit() {
  }

  onSubmit() {
    let data: ExpenseData;
    
    data = {
      id: this.expense ? this.expense.id : null,
      name: this.expenseForm.get('name').value,
      value: this.expenseForm.get('value').value,
      idPeriod: this.expenseForm.get('idPeriod').value,
      idCategory: this.expenseForm.get('idCategory').value
    }

    return this.modalCtrl.dismiss(data);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
