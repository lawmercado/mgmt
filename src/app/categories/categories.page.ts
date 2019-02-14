import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { CategoryData, DatabaseService } from 'src/services/database.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  public categories: CategoryData[];

  constructor(private db: DatabaseService, private modalCtrl: ModalController, private toastCtrl: ToastController) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.updateCategoryList();
  }

  async presentCategorieModal(category: CategoryData) {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent,
      componentProps: {
        'title': category ? 'Edit category' : 'New category',
        'category': category
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    
    if(data) {
      this.db.saveCategory(data)
        .then(() => {
          console.log('Category successfully saved!');

          this.displaySuccess('Category saved');

          this.updateCategoryList();
        })
        .catch((err) => {
          console.error('Error when creating the category');
          console.error(err);

          this.displayError('Unable to save the category');
        });
    }
  }

  deleteCategory(id: number) {
    this.db.deleteCategory(id)
      .then(() => {
        console.log('Category deleted');

        this.updateCategoryList();
      })
      .catch((err) => {
        console.error('Category could not be deleted');
        console.error(err);

        this.displayError('Can\'t delete. There are dependant periods!');
      });
  }

  private updateCategoryList() {
    this.db.listCategories()
      .then(
        (categories: CategoryData[]) => {
          this.categories = categories;
        }
      )
      .catch(
        (err) => {
          console.error("Unable to load categories!");
          console.error(err);
        }
      );
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
