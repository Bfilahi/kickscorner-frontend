import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product-service';
import { ProductResponse } from '../../../model/response/product-response';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-quick-shop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-shop.html',
  styleUrl: './quick-shop.css'
})
export class QuickShop implements OnInit{

  public products: ProductResponse[] = [];

  private partialParams: {page: number, size: number, sort: string, direction: string} = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };


  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ){}


  ngOnInit(): void {
    this.listProducts(this.partialParams);
  }


  private listProducts(partialParams: {page: number, size: number, sort: string, direction: string}){
    this.productService.getProducts(partialParams).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
  }

}