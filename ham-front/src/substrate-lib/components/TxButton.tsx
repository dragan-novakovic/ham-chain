import { useState, useEffect } from "react";
import type { FC } from "react";
import { Button } from "semantic-ui-react";
import { web3FromSource } from "@polkadot/extension-dapp";

import { useSubstrate } from "../SubstrateContext.tsx";
import utils from "../../utils/index.ts";

const TxButton: FC<any> = ({
  accountPair = null,
  label,
  setStatus,
  color = "blue",
  style = null,
  type = "QUERY",
  attrs = null,
  disabled = false,
}) => {
  // Hooks
  const { api } = useSubstrate();
  const [unsub, setUnsub] = useState(null);
  const [sudoKey, setSudoKey] = useState(null);

  const { palletRpc, callable, inputParams, paramFields } = attrs;

  const isQuery = () => type === "QUERY";
  const isSudo = () => type === "SUDO-TX";
  const isUncheckedSudo = () => type === "UNCHECKED-SUDO-TX";
  const isUnsigned = () => type === "UNSIGNED-TX";
  const isSigned = () => type === "SIGNED-TX";
  const isRpc = () => type === "RPC";
  const isConstant = () => type === "CONSTANT";

  const loadSudoKey = () => {
    (async function () {
      if (!api || !api.query.sudo) {
        return;
      }
      const sudoKey = await api.query.sudo.key();
      sudoKey.isEmpty ? setSudoKey(null) : setSudoKey(sudoKey.toString());
    })();
  };

  useEffect(loadSudoKey, [api]);

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected },
    } = accountPair;
    let fromAcct;

    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }

    return fromAcct;
  };

  const txResHandler = ({ status }: any) =>
    status.isFinalized
      ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
      : setStatus(`Current transaction status: ${status.type}`);

  const txErrHandler = (err: any) =>
    setStatus(`😞 Transaction Failed: ${err.toString()}`);

  const sudoTx = async () => {
    const fromAcct = await getFromAcct();
    const transformed = transformParams(paramFields, inputParams);
    // transformed can be empty parameters
    const txExecute = transformed
      ? api.tx.sudo.sudo(api.tx[palletRpc][callable](...transformed))
      : api.tx.sudo.sudo(api.tx[palletRpc][callable]());

    const unsub = txExecute
      .signAndSend(fromAcct, txResHandler)
      .catch(txErrHandler);
    setUnsub(() => unsub);
  };

  const uncheckedSudoTx = async () => {
    const fromAcct = await getFromAcct();
    const txExecute = api.tx.sudo.sudoUncheckedWeight(
      api.tx[palletRpc][callable](...inputParams),
      0
    );

    const unsub = txExecute
      .signAndSend(fromAcct, txResHandler)
      .catch(txErrHandler);
    setUnsub(() => unsub);
  };

  const signedTx = async () => {
    const fromAcct = await getFromAcct();
    const transformed = transformParams(paramFields, inputParams);
    // transformed can be empty parameters

    const txExecute = transformed
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]();

    const unsub = await txExecute
      .signAndSend(fromAcct, txResHandler)
      .catch(txErrHandler);
    setUnsub(() => unsub);
  };

  const unsignedTx = async () => {
    const transformed = transformParams(paramFields, inputParams);
    // transformed can be empty parameters
    const txExecute = transformed
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]();

    const unsub = await txExecute.send(txResHandler).catch(txErrHandler);
    setUnsub(() => unsub);
  };

  const queryResHandler = (result: any) =>
    result.isNone ? setStatus("None") : setStatus(result.toString());

  const query = async () => {
    const transformed = transformParams(paramFields, inputParams);
    const unsub = await api.query[palletRpc][callable](
      ...transformed,
      queryResHandler
    );
    setUnsub(() => unsub);
  };

  const rpc = async () => {
    const transformed = transformParams(paramFields, inputParams, {
      emptyAsNull: false,
    });
    const unsub = await api.rpc[palletRpc][callable](
      ...transformed,
      queryResHandler
    );
    setUnsub(() => unsub);
  };

  const constant = () => {
    const result = api.consts[palletRpc][callable];
    result.isNone ? setStatus("None") : setStatus(result.toString());
  };

  const transaction = async () => {
    if (unsub) {
      //@ts-ignore
      unsub();
      setUnsub(null);
    }

    setStatus("Sending...");

    (isSudo() && sudoTx()) ||
      (isUncheckedSudo() && uncheckedSudoTx()) ||
      (isSigned() && signedTx()) ||
      (isUnsigned() && unsignedTx()) ||
      (isQuery() && query()) ||
      (isRpc() && rpc()) ||
      (isConstant() && constant());
  };

  const transformParams = (
    paramFields: any,
    inputParams: any,
    opts = { emptyAsNull: true }
  ) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map((inputParam: any) => {
      // To cater the js quirk that `null` is a type of `object`.
      if (
        typeof inputParam === "object" &&
        inputParam !== null &&
        typeof inputParam.value === "string"
      ) {
        return inputParam.value.trim();
      } else if (typeof inputParam === "string") {
        return inputParam.trim();
      }
      return inputParam;
    });
    const params = paramFields.map((field: any, ind: any) => ({
      ...field,
      value: paramVal[ind] || null,
    }));

    return params.reduce((memo: any, { type = "string", value }: any) => {
      if (value == null || value === "")
        return opts.emptyAsNull ? [...memo, null] : memo;

      let converted = value;

      // Deal with a vector
      if (type.indexOf("Vec<") >= 0) {
        converted = converted.split(",").map((e: any) => e.trim());
        converted = converted.map((single: any) =>
          isNumType(type)
            ? single.indexOf(".") >= 0
              ? Number.parseFloat(single)
              : Number.parseInt(single)
            : single
        );
        return [...memo, converted];
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted =
          converted.indexOf(".") >= 0
            ? Number.parseFloat(converted)
            : Number.parseInt(converted);
      }
      return [...memo, converted];
    }, []);
  };

  const isNumType = (type: any) =>
    utils.paramConversion.num.some((el) => type.indexOf(el) >= 0);

  const allParamsFilled = () => {
    if (paramFields.length === 0) {
      return true;
    }

    return paramFields.every((paramField: any, ind: any) => {
      const param = inputParams[ind];
      if (paramField.optional) {
        return true;
      }
      if (param == null) {
        return false;
      }

      const value = typeof param === "object" ? param.value : param;
      return value !== null && value !== "";
    });
  };

  const isSudoer = (acctPair: any) => {
    if (!sudoKey || !acctPair) {
      return false;
    }
    return acctPair.address === sudoKey;
  };

  return (
    <Button
      basic
      color={color}
      style={style}
      type="submit"
      onClick={transaction}
      disabled={
        disabled ||
        !palletRpc ||
        !callable ||
        !allParamsFilled() ||
        ((isSudo() || isUncheckedSudo()) && !isSudoer(accountPair))
      }
    >
      {label}
    </Button>
  );
};

// prop type checking
// TxButton.propTypes = {
//   accountPair: PropTypes.object,
//   setStatus: PropTypes.func.isRequired,
//   type: PropTypes.oneOf([
//     "QUERY",
//     "RPC",
//     "SIGNED-TX",
//     "UNSIGNED-TX",
//     "SUDO-TX",
//     "UNCHECKED-SUDO-TX",
//     "CONSTANT",
//   ]).isRequired,
//   attrs: PropTypes.shape({
//     palletRpc: PropTypes.string,
//     callable: PropTypes.string,
//     inputParams: PropTypes.array,
//     paramFields: PropTypes.array,
//   }).isRequired,
// };

function TxGroupButton(props: any) {
  return (
    <Button.Group>
      <TxButton label="Unsigned" type="UNSIGNED-TX" color="grey" {...props} />
      <Button.Or />
      <TxButton label="Signed" type="SIGNED-TX" color="blue" {...props} />
      <Button.Or />
      <TxButton label="SUDO" type="SUDO-TX" color="red" {...props} />
    </Button.Group>
  );
}

export { TxButton, TxGroupButton };
