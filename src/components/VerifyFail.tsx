import React from "react";
import Alert from "./Alert";

const VerifyFail: React.FC = () => {

    return <Alert title={'Verification Failed'} message={
        'Account verification has failed. This account has either already been verified,' +
        ' or the verification link is expired. Contact admin@synergyaccounting.app if this is an error.'
    } />;

}

export default VerifyFail;
