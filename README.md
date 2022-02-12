# ham-chain

## Setup

1. Download rust https://www.rust-lang.org/tools/install
2. cargo build 


1. Farmer kreira animal
```rust
struck Animal {
id: Hash,
owner: AccountOf<T>
}
```

1. Proizvodjac kreira novi ham, podesava inicijalne vrednosti
```rust
struct Ham {
  id: Hash,
  price: BalanceOf<T>,
  ham_kind: HamKind
  owner: AccountOf<T>
  animal_id: Hash
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
