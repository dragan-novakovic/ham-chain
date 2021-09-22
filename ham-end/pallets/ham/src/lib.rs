#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_ham::*;

#[frame_support::pallet]
pub mod pallet_ham {

	use frame_support::{
		dispatch::DispatchResult,
		log::info,
		pallet_prelude::*,
		sp_runtime::traits::Hash,
		traits::{Currency, Randomness},
	};
	use frame_system::pallet_prelude::*;
	use sp_io::hashing::blake2_128;

	impl Default for HamKind {
		fn default() -> Self {
			HamKind::Regular
		}
	}

	#[pallet::pallet]
	#[pallet::generate_store(trait Store)]
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

	#[derive(Clone, Encode, Decode, PartialEq)]
	pub enum HamKind {
		PataNegra,
		Regular,
	}

	type AccountOf<T> = <T as frame_system::Config>::AccountId;
	type BalanceOf<T> =
		<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	#[derive(Clone, Encode, Decode, PartialEq)]
	pub struct Ham<T: Config> {
		id: [u8; 16],
		price: Option<BalanceOf<T>>,
		ham_type: HamKind,
		owner: AccountOf<T>,
		previous_owners: Vec<AccountOf<T>>,
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
		PriceSet(T::AccountId, T::Hash),
		Transferred(T::AccountId, T::AccountId, T::Hash),
		Bought(T::AccountId, T::AccountId, T::Hash),
	}

	// The pallet's runtime storage items.
	// https://substrate.dev/docs/en/knowledgebase/runtime/storage

	#[pallet::storage]
	#[pallet::getter(fn hams)]
	pub(super) type Hams<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Ham<T>>;

	#[pallet::storage]
	#[pallet::getter(fn all_hams_count)]
	pub(super) type AllHamsCount<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn owner_of)]
	pub(super) type HamOwner<T: Config> =
		StorageMap<_, Twox64Concat, T::Hash, Option<T::AccountId>, ValueQuery>;

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
		pub fn create_ham(origin: OriginFor<T>) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			let ham_id = Self::mint(sender.clone(), Self::gen_kinda_hash(), HamKind::Regular)?;

			info!("A Ham is born with ID {:?}.", ham_id);
			// Self::increment_nonce()?;
			Self::deposit_event(Event::Created(sender, ham_id));
			Ok(())
		}

		#[pallet::weight(100)]
		pub fn set_ham_price(
			origin: OriginFor<T>,
			ham_id: T::Hash,
			_new_price: Option<BalanceOf<T>>,
		) -> DispatchResult {
			let _sender = ensure_signed(origin)?;

			// get the ham object from storage
			let mut _ham = Self::hams(&ham_id).ok_or(Error::<T>::HamNotExist);
			Ok(().into())
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
			owner: T::AccountId,
			random_hash: [u8; 16],
			ham_type: HamKind,
		) -> Result<T::Hash, Error<T>> {
			let new_ham = Ham {
				id: random_hash,
				price: None,
				ham_type,
				owner: owner.clone(),
				previous_owners: vec![owner.clone()],
			};

			let ham_hash = T::Hashing::hash_of(&new_ham);

			let all_hams_count = Self::all_hams_count();
			let new_all_hams_count =
				all_hams_count.checked_add(1).ok_or(Error::<T>::HamCountOverflow)?;

			// Update storage with new Ham
			<Hams<T>>::insert(ham_hash, new_ham);
			<HamOwner<T>>::insert(ham_hash, Some(&owner));
			<HamsOwned<T>>::try_mutate(&owner, |ham_arr| ham_arr.try_push(ham_hash))
				.map_err(|_| Error::<T>::ExceedMaxHamOwned)?;
			<AllHamsCount<T>>::put(new_all_hams_count);

			Self::deposit_event(Event::Created(owner, ham_hash));

			Ok(ham_hash)
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

// #[cfg(test)]
// mod mock;

// #[cfg(test)]
// mod tests;

// #[cfg(feature = "runtime-benchmarks")]
// mod benchmarking;

// 	#[pallet::storage]
// 	#[pallet::getter(fn something)]
// 	// Learn more about declaring storage items:
// 	// https://substrate.dev/docs/en/knowledgebase/runtime/storage#declaring-storage-items
// 	pub type Something<T> = StorageValue<_, u32>;

// 	// Pallets use events to inform users when important changes are made.
// 	// https://substrate.dev/docs/en/knowledgebase/runtime/events
// 	#[pallet::event]
// 	#[pallet::metadata(T::AccountId = "AccountId")]
// 	#[pallet::generate_deposit(pub(super) fn deposit_event)]
// 	pub enum Event<T: Config> {
// 		/// Event documentation should end with an array that provides descriptive names for event
// 		/// parameters. [something, who]
// 		SomethingStored(u32, T::AccountId),
// 	}

// 	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
// 	// These functions materialize as "extrinsics", which are often compared to transactions.
// 	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
// 	#[pallet::call]
// 	impl<T: Config> Pallet<T> {
// 		/// An example dispatchable that takes a singles value as a parameter, writes the value to
// 		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
// 		#[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
// 		pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
// 			// Check that the extrinsic was signed and get the signer.
// 			// This function will return an error if the extrinsic is not signed.
// 			// https://substrate.dev/docs/en/knowledgebase/runtime/origin
// 			let who = ensure_signed(origin)?;

// 			// Update storage.
// 			<Something<T>>::put(something);

// 			// Emit an event.
// 			Self::deposit_event(Event::SomethingStored(something, who));
// 			// Return a successful DispatchResultWithPostInfo
// 			Ok(())
// 		}

// 		/// An example dispatchable that may throw a custom error.
// 		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1))]
// 		pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
// 			let _who = ensure_signed(origin)?;

// 			// Read a value from storage.
// 			match <Something<T>>::get() {
// 				// Return an error if the value has not been set.
// 				None => Err(Error::<T>::NoneValue)?,
// 				Some(old) => {
// 					// Increment the value read from storage; will error in the event of overflow.
// 					let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
// 					// Update the value in storage with the incremented result.
// 					<Something<T>>::put(new);
// 					Ok(())
// 				}
// 			}
// 		}
// 	}
// }
