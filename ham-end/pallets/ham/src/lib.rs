#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_ham::*;

#[frame_support::pallet]
pub mod pallet_ham {

	use frame_support::{
		dispatch::{DispatchResult, DispatchResultWithPostInfo},
		pallet_prelude::*,
		sp_runtime::traits::{Hash, Zero},
		traits::{Currency, ExistenceRequirement, Randomness},
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
	}

	#[pallet::error]
	pub enum Error<T> {}

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {}

	#[pallet::storage]
	#[pallet::getter(fn hams)]
	pub(super) type Hams<T: Config> =
		StorageMap<_, Twox64Concat, T::Hash, Ham<T::Hash, T::Balance>, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn all_hams_count)]
	pub(super) type AllHamsCount<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn get_nonce)]
	pub(super) type Nonce<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		//TODO
	}

	impl<T: Config> Pallet<T> {
		fn increment_nonce() -> DispatchResult {
			<Nonce<T>>::try_mutate(|nonce| {
				let next = nonce.checked_add(1).ok_or("Overflow")?;
				*nonce = next;

				Ok(().into())
			})
		}

		fn random_hash(sender: &T::AccountId) -> T::Hash {
			let nonce = <Nonce<T>>::get();
			let seed = T::HamRandomness::random_seed();

			T::Hashing::hash_of(&(seed, &sender, nonce))
		}
	}
}
