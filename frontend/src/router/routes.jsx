import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'));
const Customer = lazy(() => import('@/pages/Customer'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate.jsx'));
const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead.jsx'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate.jsx'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment.jsx'));
const Quote = lazy(() => import('@/pages/Quote'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate.jsx'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead.jsx'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate.jsx'));
const Payment = lazy(() => import('@/pages/Payment'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead.jsx'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate.jsx'));
const Product = lazy(() => import('@/pages/Product'));
const Supplier = lazy(() => import('@/pages/Supplier'));
const PurchaseInvoice = lazy(() => import('@/pages/PurchaseInvoice'));
const StockLedger = lazy(() => import('@/pages/StockLedger'));
const ExpenseCategory = lazy(() => import('@/pages/ExpenseCategory'));
const Expense = lazy(() => import('@/pages/Expense'));
const StockToBuy = lazy(() => import('@/pages/StockToBuy'));
const ReportsRecap = lazy(() => import('@/pages/Reports/Recap.jsx'));
const Settings = lazy(() => import('@/pages/Settings/Settings.jsx'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));
const Profile = lazy(() => import('@/pages/Profile.jsx'));
const About = lazy(() => import('@/pages/About.jsx'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },
    {
      path: '/product',
      element: <Product />,
    },
    {
      path: '/supplier',
      element: <Supplier />,
    },
    {
      path: '/purchaseinvoice',
      element: <PurchaseInvoice />,
    },
    {
      path: '/stock/ledger',
      element: <StockLedger />,
    },
    {
      path: '/expense/category',
      element: <ExpenseCategory />,
    },
    {
      path: '/expense',
      element: <Expense />,
    },
    {
      path: '/purchaseinvoice/stock-to-buy',
      element: <StockToBuy />,
    },
    {
      path: '/reports/recap',
      element: <ReportsRecap />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/taxes',
      element: <Taxes />,
    },

    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
