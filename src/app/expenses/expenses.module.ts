import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExpensesPage } from './expenses.page';
import { PeriodModalComponent } from './period-modal/period-modal.component';
import { ExpenseModalComponent } from './expense-modal/expense-modal.component';
import { BrMaskerModule } from 'br-mask';
import { PeriodExpensesModalComponent } from './period-expenses-modal/period-expenses-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ExpensesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BrMaskerModule
  ],
  entryComponents: [PeriodModalComponent, ExpenseModalComponent, PeriodExpensesModalComponent],
  declarations: [ExpensesPage, PeriodModalComponent, ExpenseModalComponent, PeriodExpensesModalComponent]
})
export class ExpensesPageModule {}
