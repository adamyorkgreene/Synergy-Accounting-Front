import React from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import ResetPassword from "./components/ResetPassword";
import ResetPasswordForm from './components/ResetPasswordForm';
import ConfirmUser from "./components/ConfirmUser";
import Verify from "./components/Verify";
import ImageUpload from "./components/ImageUploader";
import AddUser from "./components/AddUser";
import UpdateUserSearch from "./components/UpdateUserSearch";
import UpdateUser from "./components/UpdateUser";
import SendAdminEmail from "./components/SendAdminEmail";
import ChartOfAccounts from "./components/ChartOfAccounts";
import AdminInbox from "./components/AdminInbox";
import Logout from "./components/Logout";
import AddAccount from "./components/AddAccount";
import AddTransaction from "./components/AddTransaction";
import UpdateTransaction from "./components/UpdateTransaction";
import UpdateAccount from "./components/UpdateAccount";
import JournalEntryForm from "./components/JournalEntryForm";
import GeneralLedger from "./components/GeneralLedger";
import ApproveJournalEntry from "./components/ApproveJournalEntry";
import JournalEntryRequests from "./components/JournalEntryRequests";
import JournalEntryDetail from './components/JournalEntryDetail';
import EventLogViewer from "./components/EventLogViewer";
import TrialBalance from "./components/TrialBalance";
import IncomeStatement from "./components/IncomeStatement";
import BalanceSheet from "./components/BalanceSheet";
import RetainedEarningsStatement from './components/RetainedEarningsStatement';
import LandingPage from './components/LandingPage';
import PostAnnouncement from "./components/PostAnnouncement";
import VerifySuccess from "./components/VerifySuccess";
import VerifyFail from "./components/VerifyFail";
import ConfirmSuccess from "./components/ConfirmSuccess";
import ConfirmFail from "./components/ConfirmFail";
import UserReport from "./components/UserReport";
import ExpiredPasswords from "./components/ExpiredPasswords";


function App() {

    return (
        <div className="app">
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/logout" element={<Logout/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/verify" element={<Verify/>}/>
                    <Route path="/verify-success" element={<VerifySuccess/>}/>
                    <Route path="/verify-fail" element={<VerifyFail/>}/>
                    <Route path="/confirm-success" element={<ConfirmSuccess/>}/>
                    <Route path="/confirm-fail" element={<ConfirmFail/>}/>
                    <Route path="/forgot-password" element={<ResetPassword/>}/>
                    <Route path="/password-reset" element={<ResetPasswordForm/>}/>
                    <Route path="/confirm-user" element={<ConfirmUser/>}/>
                    <Route path="/dashboard" element={<LandingPage />} />
                    <Route path="/upload-image" element={<ImageUpload/>}/>
                    <Route path="/dashboard/admin/add-user" element={<AddUser/>}/>
                    <Route path="/dashboard/admin/update-user-search" element={<UpdateUserSearch/>}/>
                    <Route path="/dashboard/admin/update-user" element={<UpdateUser/>}/>
                    <Route path="/dashboard/admin/user-report" element={<UserReport/>}/>
                    <Route path="/dashboard/admin/expired-passwords" element={<ExpiredPasswords/>}/>
                    <Route path="/dashboard/send-email" element={<SendAdminEmail/>}/>
                    <Route path="/dashboard/inbox" element={<AdminInbox/>}/>
                    <Route path="/dashboard/chart-of-accounts" element={<ChartOfAccounts/>}/>
                    <Route path="/dashboard/chart-of-accounts/add" element={<AddAccount/>}/>
                    <Route path="/dashboard/chart-of-accounts/add-transaction" element={<AddTransaction/>}/>
                    <Route path="/dashboard/chart-of-accounts/update-transaction" element={<UpdateTransaction/>}/>
                    <Route path="/dashboard/chart-of-accounts/update-account" element={<UpdateAccount/>}/>
                    <Route path="/dashboard/journal-entry-form" element={<JournalEntryForm/>}/>
                    <Route path="/dashboard/journal-entry-detail" element={<JournalEntryDetail/>}/>
                    <Route path="/dashboard/general-ledger" element={<GeneralLedger/>}/>
                    <Route path="/approve-journal-entry" element={<ApproveJournalEntry/>}/>
                    <Route path="/dashboard/manager/journal-entry-requests" element={<JournalEntryRequests/>}/>
                    <Route path="/dashboard/chart-of-accounts/event-logs" element={<EventLogViewer />} />
                    <Route path="/dashboard/general-ledger/trial-balance" element={<TrialBalance/>} />
                    <Route path="/dashboard/income-statement" element={<IncomeStatement/>} />
                    <Route path="/dashboard/balance-sheet" element={<BalanceSheet/>} />
                    <Route path="/dashboard/manager/post-announcement" element={<PostAnnouncement/>} />
                    <Route path="/dashboard/retained-earnings" element={<RetainedEarningsStatement/>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;