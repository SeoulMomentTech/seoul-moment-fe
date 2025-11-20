declare const __brand: unique symbol;
interface Brand<B> {
  [__brand]: B;
}
type Branded<T, B> = T & Brand<B>;
