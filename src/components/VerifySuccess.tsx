import React from "react";
import Alert from "./Alert";

const VerifySuccess: React.FC = () => {

    return <Alert title={'Verification Successful'} message={
        'Your account has successfully been verified. You may now close this window.'
    } />;

}

export default VerifySuccess;
