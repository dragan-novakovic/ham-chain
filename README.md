# ham-chain

## Setup

1. Download rust https://www.rust-lang.org/tools/install
2. cargo build 

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
