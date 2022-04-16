#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_ham::*;

#[frame_support::pallet]
pub mod pallet_ham {

	use frame_support::{
		dispatch::DispatchResult,
		log::info,
		pallet_prelude::*,
		sp_runtime::traits::Hash,
		traits::{tokens::ExistenceRequirement, Currency, Randomness},
		transactional,
	};
	use frame_system::pallet_prelude::*;
	use scale_info::TypeInfo;
	use sp_io::hashing::blake2_128;
	use sp_runtime::sp_std::if_std;

	#[cfg(feature = "std")]
	use serde::{Deserialize, Serialize};

	impl Default for HamKind {
		fn default() -> Self {
			HamKind::Regular
		}
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	/// Config the pallet by specifying the parameters and types it depends on.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it dependes on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
		type HamRandomness: Randomness<Self::Hash, Self::BlockNumber>;
		type MaxHamsOwned: Get<u32>;
		type Currency: Currency<Self::AccountId>;
	}

	// Our pallet's genesis configuration.
	#[pallet::genesis_config]
	pub struct GenesisConfig<T: Config> {
		pub hams: Vec<(T::AccountId, [u8; 16], HamKind)>,
		pub animals: Vec<(T::AccountId, [u8; 16])>,
	}

	/*

	[
		{
			"key": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
			"value": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
			"text": "ALICE",
			"icon": "user"
		},
		{
			"key": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
			"value": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
			"text": "ALICE_STASH",
			"icon": "user"
		},
		{
			"key": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
			"value": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
			"text": "BOB",
			"icon": "user"
		},
		{
			"key": "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
			"value": "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
			"text": "BOB_STASH",
			"icon": "user"
		},
		{
			"key": "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
			"value": "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
			"text": "CHARLIE",
			"icon": "user"
		},
		{
			"key": "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
			"value": "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
			"text": "DAVE",
			"icon": "user"
		},
		{
			"key": "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
			"value": "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
			"text": "EVE",
			"icon": "user"
		},
		{
			"key": "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL",
			"value": "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL",
			"text": "FERDIE",
			"icon": "user"
		}
	]


	 */

	// Required to implement default for GenesisConfig.
	#[cfg(feature = "std")]
	impl<T: Config> Default for GenesisConfig<T> {
		fn default() -> GenesisConfig<T> {
			GenesisConfig { hams: vec![], animals: vec![] }
		}
	}

	#[pallet::genesis_build]
	impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
		fn build(&self) {
			// When building a ham from genesis config, we require the id and ham_type to be
			// supplied.
			for (acct, random_hash) in &self.animals {
				let _ = <Pallet<T>>::mint_animal(acct, random_hash.clone());
			}
		}
	}

	#[derive(Encode, Decode, Debug, Clone, PartialEq, TypeInfo)]
	#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
	#[scale_info(skip_type_params(T))]
	pub enum HamKind {
		PataNegra,
		Regular,
	}

	type AccountOf<T> = <T as frame_system::Config>::AccountId;
	type BalanceOf<T> =
		<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	#[derive(Clone, Encode, Decode, PartialEq, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Animal<T: Config> {
		id: [u8; 16],
		owner: AccountOf<T>,
		price: Option<BalanceOf<T>>,
	}

	#[derive(Clone, Encode, Decode, PartialEq, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Ham<T: Config> {
		id: [u8; 16],
		price: Option<BalanceOf<T>>,
		ham_type: HamKind,
		owner: AccountOf<T>,
		animal_id: [u8; 16],
	}

	#[pallet::error]
	pub enum Error<T> {
		NonceOverflow,
		HamAddOverflow,
		BuyerIsHamOwner,
		BuyerisAnimalOwner,
		/// Cannot transfer a ham to its owner.
		TransferToSelf,
		/// Handles checking whether the Ham exists.
		HamNotExist,
		AnimalNotExist,
		/// Handles checking that the Ham is owned by the account transferring, buying or setting a
		/// price for it.
		NotHamOwner,
		NotAnimalOwner,
		/// Ensures the Ham is for sale.
		HamNotForSale,
		/// Ensures that the buying price is greater than the asking price.
		HamBidPriceTooLow,
		/// Ensures that an account has enough funds to purchase a Ham.
		NotEnoughBalance,
	}

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		Created(T::AccountId, [u8; 16]),
		PriceSet(T::AccountId, [u8; 16], Option<BalanceOf<T>>),
		Transferred(T::AccountId, T::AccountId, [u8; 16]),
		Bought(T::AccountId, T::AccountId, [u8; 16], BalanceOf<T>),
	}

	// The pallet's runtime storage items.
	// https://substrate.dev/docs/en/knowledgebase/runtime/storage

	#[pallet::storage]
	#[pallet::getter(fn hams)]
	pub(super) type Hams<T: Config> = StorageMap<_, Twox64Concat, [u8; 16], Ham<T>>;

	#[pallet::storage]
	#[pallet::getter(fn animals)]
	pub(super) type Animals<T: Config> = StorageMap<_, Twox64Concat, [u8; 16], Animal<T>>;

	#[pallet::storage]
	#[pallet::getter(fn all_hams_count)]
	pub(super) type AllHamsCount<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn owner_of)]
	pub(super) type HamOwner<T: Config> =
		StorageMap<_, Twox64Concat, [u8; 16], Option<T::AccountId>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn animal_owner_of)]
	pub(super) type AnimalOwner<T: Config> =
		StorageMap<_, Twox64Concat, [u8; 16], Option<T::AccountId>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn ham_of_owner_by_index)]
	pub(super) type OwnedHamsArray<T: Config> =
		StorageMap<_, Twox64Concat, (T::AccountId, u64), [u8; 16], ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn get_nonce)]
	pub(super) type Nonce<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn hams_owned)]
	pub(super) type HamsOwned<T: Config> = StorageMap<
		_,
		Twox64Concat,
		T::AccountId,
		BoundedVec<[u8; 16], T::MaxHamsOwned>,
		ValueQuery,
	>;

	#[pallet::storage]
	#[pallet::getter(fn animals_owned)]
	pub(super) type AnimalsOwned<T: Config> =
		StorageMap<_, Twox64Concat, T::AccountId, [u8; 16], ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn owned_hams_count)]
	pub(super) type OwnedHamsCount<T: Config> =
		StorageMap<_, Twox64Concat, T::AccountId, u64, ValueQuery>;

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::weight(100)]
		pub fn create_ham(
			origin: OriginFor<T>,
			ham_kind: Option<HamKind>,
			animal_id: [u8; 16],
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			let ham_kind = match ham_kind {
				Some(value) => value,
				None => HamKind::default(),
			};
			let ham_id = Self::mint(&sender, Self::gen_kinda_hash(), ham_kind, animal_id)?;

			info!("A Ham is born with ID {:?}.", ham_id);
			// Self::increment_nonce()?;
			Self::deposit_event(Event::Created(sender, ham_id));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn create_animal(origin: OriginFor<T>) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			let animal_id = Self::mint_animal(&sender, Self::gen_kinda_hash())?;

			info!("A New Animal with ID {:?}.", animal_id);

			Self::deposit_event(Event::Created(sender, animal_id));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn set_ham_price(
			origin: OriginFor<T>,
			ham_id: [u8; 16],
			new_price: Option<BalanceOf<T>>,
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			// get the ham object from storage
			let mut ham = Self::hams(&ham_id).ok_or(Error::<T>::HamNotExist)?;
			// set Ham Price
			ham.price = new_price.clone();

			<Hams<T>>::insert(&ham_id, ham);

			// deposit a PriceSet event
			Self::deposit_event(Event::PriceSet(sender, ham_id, new_price));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn set_animal_price(
			origin: OriginFor<T>,
			animal_id: [u8; 16],
			new_price: Option<BalanceOf<T>>,
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			// get the animal object from storage
			let mut animal = Self::animals(&animal_id).ok_or(Error::<T>::AnimalNotExist)?;
			// set Animal Price
			animal.price = new_price.clone();

			<Animals<T>>::insert(&animal_id, animal);

			// deposit a PriceSet event
			Self::deposit_event(Event::PriceSet(sender, animal_id, new_price));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn transfer(
			origin: OriginFor<T>,
			to: T::AccountId,
			ham_id: [u8; 16],
		) -> DispatchResult {
			let from = ensure_signed(origin)?;

			// Ensure the ham exists and is called by the ham owner
			ensure!(Self::is_ham_owner(&ham_id, &from)?, <Error<T>>::NotHamOwner);

			// Verify the ham is not transferring back to its owner.
			ensure!(from != to, <Error<T>>::TransferToSelf);

			Self::transfer_ham_to(&ham_id, &to)?;

			Self::deposit_event(Event::Transferred(from, to, ham_id));

			Ok(())
		}

		#[pallet::weight(100)]
		pub fn transfer_animal(
			origin: OriginFor<T>,
			to: T::AccountId,
			animal_id: [u8; 16],
		) -> DispatchResult {
			let from = ensure_signed(origin)?;

			// Ensure the ham exists and is called by the ham owner
			ensure!(Self::is_animal_owner(&animal_id, &from)?, <Error<T>>::NotAnimalOwner);

			// Verify the ham is not transferring back to its owner.
			ensure!(from != to, <Error<T>>::TransferToSelf);

			Self::transfer_animal_to(&animal_id, &to)?;

			Self::deposit_event(Event::Transferred(from, to, animal_id));

			Ok(())
		}

		#[transactional]
		#[pallet::weight(100)]
		pub fn buy_ham(
			origin: OriginFor<T>,
			ham_id: [u8; 16],
			bid_price: BalanceOf<T>,
		) -> DispatchResult {
			let buyer = ensure_signed(origin)?;

			let ham = Self::hams(&ham_id).ok_or(<Error<T>>::HamNotExist)?;
			ensure!(ham.owner != buyer, <Error<T>>::BuyerIsHamOwner);

			// Check the ham is for sale and the ham ask price <= bid_price
			if let Some(ask_price) = ham.price {
				ensure!(ask_price <= bid_price, <Error<T>>::HamBidPriceTooLow);
			} else {
				Err(<Error<T>>::HamNotForSale)?;
			}

			// Check the buyer has enough free balance
			ensure!(T::Currency::free_balance(&buyer) >= bid_price, <Error<T>>::NotEnoughBalance);

			// Verify the buyer has the capacity to receive one more ham
			//	let to_owned = <HamsOwned<T>>::get(&buyer);

			let seller = ham.owner.clone();

			// Transfer the amount from buyer to seller
			T::Currency::transfer(&buyer, &seller, bid_price, ExistenceRequirement::KeepAlive)?;

			// Transfer the ham from seller to buyer
			Self::transfer_ham_to(&ham_id, &buyer)?;

			Self::deposit_event(Event::Bought(buyer, seller, ham_id, bid_price));

			Ok(())
		}

		#[transactional]
		#[pallet::weight(100)]
		pub fn buy_animal(
			origin: OriginFor<T>,
			animal_id: [u8; 16],
			bid_price: BalanceOf<T>,
		) -> DispatchResult {
			let buyer = ensure_signed(origin)?;

			let animal = Self::animals(&animal_id).ok_or(<Error<T>>::AnimalNotExist)?;
			ensure!(animal.owner != buyer, <Error<T>>::BuyerisAnimalOwner);

			// Check the ham is for sale and the ham ask price <= bid_price
			if let Some(ask_price) = animal.price {
				ensure!(ask_price <= bid_price, <Error<T>>::HamBidPriceTooLow);
			} else {
				Err(<Error<T>>::HamNotForSale)?;
			}

			// Check the buyer has enough free balance
			ensure!(T::Currency::free_balance(&buyer) >= bid_price, <Error<T>>::NotEnoughBalance);

			// Verify the buyer has the capacity to receive one more ham
			//	let to_owned = <HamsOwned<T>>::get(&buyer);

			let seller = animal.owner.clone();

			// Transfer the amount from buyer to seller
			T::Currency::transfer(&buyer, &seller, bid_price, ExistenceRequirement::KeepAlive)?;

			// Transfer the ham from seller to buyer
			Self::transfer_animal_to(&animal_id, &buyer)?;

			Self::deposit_event(Event::Bought(buyer, seller, animal_id, bid_price));

			Ok(())
		}
	}

	impl<T: Config> Pallet<T> {
		fn _increment_nonce() -> DispatchResult {
			<Nonce<T>>::try_mutate(|nonce| {
				let next = nonce.checked_add(1).ok_or(Error::<T>::NonceOverflow)?;
				*nonce = next;

				Ok(().into())
			})
		}

		fn mint(
			owner: &T::AccountId,
			ham_id: [u8; 16],
			ham_type: HamKind,
			animal_id: [u8; 16],
		) -> Result<[u8; 16], Error<T>> {
			let new_ham =
				Ham::<T> { id: ham_id, price: None, ham_type, owner: owner.clone(), animal_id };

			let all_hams_count = Self::all_hams_count();
			let new_all_hams_count =
				all_hams_count.checked_add(1).ok_or(Error::<T>::HamAddOverflow)?;

			// Update storage with new Ham
			<Hams<T>>::insert(ham_id, new_ham);
			<HamOwner<T>>::insert(ham_id, Some(&owner));
			<HamsOwned<T>>::try_mutate(&owner, |ham_arr| ham_arr.try_push(ham_id)).unwrap();
			<AllHamsCount<T>>::put(new_all_hams_count);

			Self::deposit_event(Event::Created(owner.clone(), ham_id));

			Ok(ham_id)
		}

		fn mint_animal(owner: &T::AccountId, id: [u8; 16]) -> Result<[u8; 16], Error<T>> {
			let new_animal = Animal::<T> { id, owner: owner.clone(), price: None };

			//Update storage
			<Animals<T>>::insert(id, new_animal);

			Ok(id)
		}

		#[transactional]
		pub fn transfer_ham_to(ham_id: &[u8; 16], to: &T::AccountId) -> DispatchResult {
			let mut ham = Self::hams(&ham_id).ok_or(<Error<T>>::HamNotExist)?;

			let prev_owner = ham.owner.clone();

			<HamsOwned<T>>::try_mutate(&prev_owner, |owned| {
				if let Some(ind) = owned.iter().position(|&id| id == *ham_id) {
					owned.swap_remove(ind);
					return Ok(());
				}
				Err(())
			})
			.map_err(|_| <Error<T>>::HamNotExist)?;

			ham.owner = to.clone();

			ham.price = None;
			<Hams<T>>::insert(ham_id, ham);
			<HamsOwned<T>>::try_mutate(to, |vec| vec.try_push(*ham_id)).unwrap();

			Ok(())
		}

		#[transactional]
		pub fn transfer_animal_to(animal_id: &[u8; 16], to: &T::AccountId) -> DispatchResult {
			let mut animal = Self::animals(&animal_id).ok_or(<Error<T>>::AnimalNotExist)?;

			let prev_owner = animal.owner.clone();

			<AnimalsOwned<T>>::swap(prev_owner, to.clone());

			animal.owner = to.clone();
			animal.price = None;

			<Animals<T>>::insert(animal_id, animal);
			<AnimalsOwned<T>>::insert(to, animal_id);

			Ok(())
		}

		pub fn is_ham_owner(ham_id: &[u8; 16], acct: &T::AccountId) -> Result<bool, Error<T>> {
			match Self::hams(ham_id) {
				Some(ham) => Ok(ham.owner == *acct),
				None => Err(<Error<T>>::HamNotExist),
			}
		}

		pub fn is_animal_owner(
			animal_id: &[u8; 16],
			acct: &T::AccountId,
		) -> Result<bool, Error<T>> {
			match Self::animals(*animal_id) {
				Some(animal) => Ok(animal.owner == *acct),
				None => Err(<Error<T>>::AnimalNotExist),
			}
		}

		fn _random_hash(sender: &T::AccountId) -> T::Hash {
			let nonce = <Nonce<T>>::get();
			let seed = T::HamRandomness::random_seed();

			T::Hashing::hash_of(&(seed, &sender, nonce))
		}

		fn gen_kinda_hash() -> [u8; 16] {
			let payload = (
				T::HamRandomness::random(&b"dna"[..]).0,
				<frame_system::Pallet<T>>::block_number(),
			);
			payload.using_encoded(blake2_128)
		}
	}
}
