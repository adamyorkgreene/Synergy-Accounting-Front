import React from "react";
import Alert from "./Alert";

const ConfirmFail: React.FC = () => {

    return <Alert title={'Confirmation Failed'} message={
        'Account confirmation has failed. This account has either already been confirmed,' +
        ' or the confirmation link is expired. Contact admin@synergyaccounting.app if this is an error.'
    } />;

}

export default ConfirmFail;
