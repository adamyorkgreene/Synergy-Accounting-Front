import React from "react";
import Alert from "./Alert";

const ConfirmSuccess: React.FC = () => {

    return <Alert title={'Confirmation Successful'} message={
        'This account has successfully been confirmed. You may now close this window.'
    } />;

}

export default ConfirmSuccess;
