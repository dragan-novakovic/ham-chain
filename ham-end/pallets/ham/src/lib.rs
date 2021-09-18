#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_ham::*;

#[frame_support::pallet]
pub mod pallet_ham {

	use frame_support::{
		dispatch::{DispatchResult, DispatchResultWithPostInfo},
		pallet_prelude::*,
		sp_runtime::traits::Hash,
		traits::Randomness,
	};
	use frame_system::pallet_prelude::*;
	use sp_core::H256;

	impl Default for HamKind {
		fn default() -> Self {
			HamKind::Regular
		}
	}

	#[derive(Clone, Encode, Decode, PartialEq)]
	pub enum HamKind {
		PataNegra,
		Regular,
	}

	#[derive(Clone, Encode, Decode, Default, PartialEq)]
	pub struct Ham<Hash, Balance> {
		id: Hash,
		origin: Hash,
		price: Balance,
		ham_type: HamKind,
	}

	#[pallet::pallet]
	#[pallet::generate_store(trait Store)]
	pub struct Pallet<T>(_);

	/// Config the pallet by specifying the parameters and types it depends on.
	#[pallet::config]
	pub trait Config: pallet_balances::Config + frame_system::Config {
		/// Because this pallet emits events, it dependes on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
		type HamRandomness: Randomness<H256, u32>;
		type MaxHamsOwned: Get<u32>;
	}

	#[pallet::error]
	pub enum Error<T> {
		NonceOverflow,
	}

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		Created(T::AccountId, T::Hash),
		PriceSet(T::AccountId, T::Hash, T::Balance),
		Transferred(T::AccountId, T::AccountId, T::Hash),
		Bought(T::AccountId, T::AccountId, T::Hash, T::Balance),
	}

	#[pallet::storage]
	#[pallet::getter(fn hams)]
	pub(super) type Hams<T: Config> =
		StorageMap<_, Twox64Concat, T::Hash, Ham<T::Hash, T::Balance>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn all_hams_count)]
	pub(super) type AllHamsCount<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn owner_of)]
	pub(super) type HamOwner<T: Config> =
		StorageMap<_, Twox64Concat, T::Hash, Option<T::AccountId>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn ham_by_index)]
	pub(super) type AllHamsArray<T: Config> = StorageMap<_, Twox64Concat, u64, T::Hash, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn ham_of_owner_by_index)]
	pub(super) type OwnedHamsArray<T: Config> =
		StorageMap<_, Twox64Concat, (T::AccountId, u64), T::Hash, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn get_nonce)]
	pub(super) type Nonce<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn hams_owned)]
	pub(super) type HamsOwned<T: Config> =
		StorageMap<_, Twox64Concat, T::AccountId, BoundedVec<T::Hash, T::MaxHamsOwned>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn owned_hams_count)]
	pub(super) type OwnedHamsCount<T: Config> =
		StorageMap<_, Twox64Concat, T::AccountId, u64, ValueQuery>;

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::weight(100)]
		pub fn create_ham(origin: OriginFor<T>) -> DispatchResultWithPostInfo {
			let sender = ensure_signed(origin)?;
			let random_hash = Self::random_hash(&sender);

			let new_ham = Ham {
				id: random_hash,
				origin: random_hash,
				price: 0u8.into(),
				ham_type: HamKind::Regular,
			};

			Self::mint(sender, random_hash, new_ham)?;
			Self::increment_nonce()?;

			Ok(().into())
		}
	}

	impl<T: Config> Pallet<T> {
		fn increment_nonce() -> DispatchResult {
			<Nonce<T>>::try_mutate(|nonce| {
				let next = nonce.checked_add(1).ok_or(Error::<T>::NonceOverflow)?;
				*nonce = next;

				Ok(().into())
			})
		}

		fn mint(
			to: T::AccountId,
			ham_id: T::Hash,
			new_ham: Ham<T::Hash, T::Balance>,
		) -> DispatchResult {
			ensure!(!<HamOwner<T>>::contains_key(ham_id), "Ham already contains key");

			//let owned_ham_count = Self::owned_ham_count(&to);
			// let new_owned_ham_count = owned_ham_count
			// 	.checked_add(1)
			// 	.ok_or("Overflow adding a new ham to account balance")?;

			// let all_hams_count = Self::all_hams_count();
			// let new_all_hams_count = all_hams_count
			// 	.checked_add(1)
			// 	.ok_or("Overflow adding a new ham to total supply")?;

			// Update storage with new Ham
			<Hams<T>>::insert(ham_id, new_ham);
			<HamOwner<T>>::insert(ham_id, Some(&to));
			Self::deposit_event(Event::Created(to, ham_id));

			// <AllHamsArray<T>::insert(0, ham_id);

			Ok(().into())
		}

		fn random_hash(sender: &T::AccountId) -> T::Hash {
			let nonce = <Nonce<T>>::get();
			let seed = T::HamRandomness::random_seed();

			T::Hashing::hash_of(&(seed, &sender, nonce))
		}
	}
}
