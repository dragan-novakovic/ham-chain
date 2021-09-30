# ham-chain

TLDR;
1. Proizvodjac kreira novi ham, podesava inicijalne vrednosti
```rust
struct Ham {
  id: Hash,
  price: BalanceOf<T>,
  ham_kind: HamKind
  owner: AccountOf<T>
  }
```

2. Distributer (koji je node) radi re-sale

3. Krajnji korisnik ima celu putanju vlasnistva
- Cela list vlasnika
- Zadnja cena
- Datumi Prodaje


UI

- Login centralizovan api - povezan sa wallet
- Permisije
