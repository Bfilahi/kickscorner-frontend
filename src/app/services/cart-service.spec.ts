import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { CartService } from './cart-service';
import { CartItem } from '../model/cart-item';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';

describe('CartService', () => {
  let service: CartService;

  let mockCartItems: CartItem[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: PLATFORM_ID, useValue: 'browser'}
      ]
    });
    service = TestBed.inject(CartService);

    mockCartItems = [
      {
        id: 1,
        name: 'Classic White T-Shirt',
        description:
          'A comfortable and stylish white t-shirt for everyday wear.',
        brand: {
          id: 101,
          name: 'Nike',
        },
        selectedSize: 'M',
        price: 19.99,
        quantity: 2,
        images: [
          {
            publicId: 'nike-white-tee-1',
            imgUrl: 'https://example.com/images/nike-white-tee-1.jpg',
          },
          {
            publicId: 'nike-white-tee-2',
            imgUrl: 'https://example.com/images/nike-white-tee-2.jpg',
          },
        ],
      },
      {
        id: 2,
        name: 'Slim Fit Jeans',
        description: 'Dark blue slim fit jeans with a modern cut.',
        brand: {
          id: 102,
          name: "Levi's",
        },
        selectedSize: 'L',
        price: 49.99,
        quantity: 1,
        images: [
          {
            publicId: 'levis-jeans-1',
            imgUrl: 'https://example.com/images/levis-jeans-1.jpg',
          },
        ],
      },
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load cart items from localStorage', async () => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockCartItems));

      const service = new CartService('browser');

      const items = await firstValueFrom(service.cartItems$);
      expect(items).toEqual(mockCartItems);
      expect(localStorage.getItem).toHaveBeenCalledWith('cartItems');
    });

    it('should start with an empty cart when localStorage has no items', async () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const service = new CartService('browser');

      const items = await firstValueFrom(service.cartItems$);
      expect(items).toEqual([]);
    });

    it('should not access localStorage in a non-browser environment (SSR safety)', async () => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockCartItems));

      const service = new CartService('no-browser');

      const items = await firstValueFrom(service.cartItems$);
      expect(items).toEqual([]);
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('addToCart()', () => {
    let initialLength: number;

    beforeEach(() => {
      service.clearCart();
      service.addToCart(mockCartItems[0]);
      initialLength = mockCartItems.length;
    });

    it('should add a new item to an empty cart', async () => {
      const items = await firstValueFrom(service.cartItems$);
      expect(items.length).toBe(1);
    });

    it('should add a new item to a cart that already has items', async () => {
      service.addToCart(mockCartItems[1]);

      const items = await firstValueFrom(service.cartItems$);
      expect(items).toEqual(mockCartItems);
      expect(items.length).toBe(initialLength);
    });

    it('should increment quantity instead of duplicating when the same item and same selectedSize already exist', async () => {
      const initialQuantity = mockCartItems[0].quantity;
      service.addToCart(mockCartItems[0]);

      const items = await firstValueFrom(service.cartItems$);
      expect(items[0].quantity).toBe(initialQuantity + 1);
    });

    it('should treat the same item with a different selectedSize as a separate cart entry', async () => {
      const newCartItem = structuredClone(mockCartItems[0]);
      newCartItem.selectedSize = 'L';
      service.addToCart(newCartItem);

      const items = await firstValueFrom(service.cartItems$);
      expect(items.length).toBe(initialLength);
    });

    it('should persist to localStorage after adding', () => {
      spyOn(localStorage, 'setItem');

      service.addToCart(mockCartItems[1]);

      expect(localStorage.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify(service['cartItemsSubject'].value));
    });
  });

  describe('removeFromCart()', () => {
    beforeEach(() => {
      const newCartItem = structuredClone(mockCartItems[0]);
      newCartItem.selectedSize = 'L';
      mockCartItems.push(newCartItem);

      mockCartItems.forEach(item => service.addToCart(item));
    });

    it('should remove the correct item by id', async () => {
      const initialLength = mockCartItems.length;
      service.removeFromCart(mockCartItems[0]);

      const items = await firstValueFrom(service.cartItems$);
      expect(items.length).toBe(initialLength - 1);
      expect(items.find(item => item.id === mockCartItems[0].id && item.selectedSize === mockCartItems[0].selectedSize))
      .toBeUndefined();
    });

    it('should call clearCart when the cart becomes empty after removal', async () => {
      spyOn(localStorage, 'removeItem');
      mockCartItems.forEach(item => service.removeFromCart(item));

      const items = await firstValueFrom(service.cartItems$);
      expect(items.length).toBe(0);
      expect(localStorage.removeItem).toHaveBeenCalledWith('cartItems');
    });

    it('should call persistCartItems when items still remain', () =>{
      spyOn(localStorage, 'setItem');
      service.removeFromCart(mockCartItems[1]);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cartItems',
        JSON.stringify(service['cartItemsSubject'].value),
      );
    });

    it('should not remove items with the same id but different selectedSize', async () => {
      const initialLength = mockCartItems.length;

      service.removeFromCart(mockCartItems[0]);

      const items = await firstValueFrom(service.cartItems$);
      expect(items.length).toBe(initialLength - 1);
    });
  });

  describe('incrementQuantity()', () => {
    it('should increase the item\'s quantity by exactly 1 and should persist to localStorage', () => {
      const initialQuantity = mockCartItems[1].quantity;
      spyOn(localStorage, 'setItem');
      service.incrementQuantity(mockCartItems[1]);

      expect(mockCartItems[1].quantity).toBe(initialQuantity + 1);
      expect(localStorage.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify(service['cartItemsSubject'].value));
    });
  });

  describe('decrementQuantity()', () => {
    it('should decreases the item\'s quantity by exactly 1 and should persist to localStorage', () => {
      const initialQuantity = mockCartItems[0].quantity;
      spyOn(localStorage, 'setItem');
      service.decrementQuantity(mockCartItems[0]);

      expect(mockCartItems[0].quantity).toBe(initialQuantity - 1);
      expect(localStorage.setItem).toHaveBeenCalledWith('cartItems', JSON.stringify(service['cartItemsSubject'].value));
    });

    it('should call removeFromCart when quantity reaches 0', () => {
      spyOn(service, 'removeFromCart');

      const quantity: number = mockCartItems[0].quantity;
      for(let i = 0; i < quantity; i++)
        service.decrementQuantity(mockCartItems[0]);

      expect(service.removeFromCart).toHaveBeenCalled();
    });
  });

  describe('clearCart()', () => {
    it('should reset the cart to an empty array and should remove cartItems from localStorage', async () => {
      const service = new CartService('browser');
      spyOn(localStorage, 'removeItem');

      service.clearCart();

      const items = await firstValueFrom(service.cartItems$);
      expect(items).toEqual([]);
      expect(items.length).toBe(0);
      expect(localStorage.removeItem).toHaveBeenCalledWith('cartItems');
    });

    it('should not attempt localStorage access in a non-browser environment', () => {
      const service = new CartService('no-browser');
      spyOn(localStorage, 'removeItem');

      service.clearCart();

      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('getTotal()', () => {
    beforeEach(() => {
      service.clearCart();
    });

    it('should return 0 for an empty cart', () => {
      const total: number = service.getTotal();

      expect(total).toBe(0);
    });

    it('should correctly calculate the sum of price * quantity across all items', () => {
      mockCartItems.forEach((item) => service.addToCart(item));

      const total: number = service.getTotal();

      expect(total).toBeCloseTo(89.97, 2);
    });

    it('should skip items where price is falsy', () => {
      const newCartItem = structuredClone(mockCartItems[0]);
      newCartItem.selectedSize = 'L';
      newCartItem.price = null;
      mockCartItems.push(newCartItem);
      mockCartItems.forEach((item) => service.addToCart(item));

      const total: number = service.getTotal();

      expect(total).toBeCloseTo(89.97, 2);
    });
  });

});
