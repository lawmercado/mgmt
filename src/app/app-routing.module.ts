import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'expenses', loadChildren: './expenses/expenses.module#ExpensesPageModule' },
  { path: 'goals', loadChildren: './goals/goals.module#GoalsPageModule' },
  { path: 'categories', loadChildren: './categories/categories.module#CategoriesPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
