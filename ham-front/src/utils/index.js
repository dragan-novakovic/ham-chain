// Construct a Ham ID from storage key
const convertToHamHash = (entry) => `0x${entry[0].toJSON().slice(-64)}`;

// Construct a Ham object
const constructHam = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON(),
});

// Use React hooks
export default function Hams(props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [HamHashes, setHamHashes] = useState([]);
  const [Hams, setHams] = useState([]);
  const [status, setStatus] = useState("");
}
