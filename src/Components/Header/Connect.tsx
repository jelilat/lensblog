import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
global.Buffer = global.Buffer || require('buffer').Buffer;

export default function Connect() {
  const { data: account } = useAccount();
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: account?.address });
  const { data: ensName } = useEnsName({ address: account?.address });
  const { connect, connectors, error, isConnecting, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  if (account) {
    return (
      <div>
        {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
        <div>
          {ensName ? `${ensName} (${account.address})` : account.address}
        </div>
        <div>Connected to {account?.connector?.name}</div>
        <button
          onClick={() => {
            disconnect();
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect(connector)}
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isConnecting &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}
