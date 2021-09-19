#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_ham::*;

#[frame_support::pallet]
pub mod pallet_ham {

	use frame_support::{
		dispatch::{DispatchResult, DispatchResultWithPostInfo},
		pallet_prelude::*,
		sp_runtime::traits::Hash,
		traits::{Currency, Randomness},
	};
	use frame_system::pallet_prelude::*;
	use sp_core::H256;

	#[cfg(feature = "std")]
	use serde::{Deserialize, Serialize};

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

	type AccountOf<T> = <T as frame_system::Config>::AccountId;
	type BalanceOf<T> =
		<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	#[derive(Clone, Encode, Decode, Default, PartialEq)]
	pub struct Ham<Hash, Balance> {
		id: Hash,
		origin: Hash,
		created_at: String,
		price: Balance,
		ham_type: HamKind,
		owner: AccountOf<T>,
		previous_owners: Vec<AccountOf<T>>,
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
		type Currency: Currency<Self::AccountId>;
	}

	#[pallet::error]
	pub enum Error<T> {
		NonceOverflow,
		HamCountOverflow,
		/// An account cannot own more Hams than `MaxHamCount`.
		ExceedMaxHamOwned,
		/// Buyer cannot be the owner.
		BuyerIsHamOwner,
		/// Cannot transfer a ham to its owner.
		TransferToSelf,
		/// Handles checking whether the Ham exists.
		HamNotExist,
		/// Handles checking that the Ham is owned by the account transferring, buying or setting a price for it.
		NotHamOwner,
		/// Ensures the Ham is for sale.
		HamNotForSale,
		/// Ensures that the buying price is greater than the asking price.
		HamBidPriceTooLow,
		/// Ensures that an account has enough funds to purchase a Ham.
		NotEnoughBalance,
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
				created_at: String::from("Begining of time"),
				price: 0u8.into(),
				ham_type: HamKind::Regular,
				owner: sender,
				previous_owners: vec![sender],
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
			ensure!(!<HamOwner<T>>::contains_key(ham_id), Error::<T>::BuyerIsHamOwner);

			let owned_hams_count = Self::owned_hams_count(&to);
			let new_owned_hams_count =
				owned_hams_count.checked_add(1).ok_or(Error::<T>::NotEnoughBalance)?;

			let all_hams_count = Self::all_hams_count();
			let new_all_hams_count =
				all_hams_count.checked_add(1).ok_or(Error::<T>::HamCountOverflow)?;

			// Update storage with new Ham
			<Hams<T>>::insert(ham_id, new_ham);
			<HamOwner<T>>::insert(ham_id, Some(&to));
			<HamsOwned<T>>::try_mutate(&to, |ham_arr| ham_arr.try_push(ham_id))
				.map_err(|_| Error::<T>::ExceedMaxHamOwned);
			<OwnedHamsCount<T>>::insert(&to, new_owned_hams_count);

			Self::deposit_event(Event::Created(to, ham_id));

			<AllHamsArray<T>>::insert(all_hams_count, ham_id);
			<AllHamsCount<T>>::put(new_all_hams_count);

			Ok(().into())
		}

		fn random_hash(sender: &T::AccountId) -> T::Hash {
			let nonce = <Nonce<T>>::get();
			let seed = T::HamRandomness::random_seed();

			T::Hashing::hash_of(&(seed, &sender, nonce))
		}
	}
}
