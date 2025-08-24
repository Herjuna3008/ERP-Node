import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Product = lazy(() => import('@/pages/Product'));
const ProductCreate = lazy(() => import('@/pages/Product/ProductCreate'));
const ProductUpdate = lazy(() => import('@/pages/Product/ProductUpdate'));
const Supplier = lazy(() => import('@/pages/Supplier'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazy(() => import('@/pages/Quote/index'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));
const DeliveryNote = lazy(() => import('@/pages/DeliveryNote'));
const Expense = lazy(() => import('@/pages/Expense'));

const PurchaseCreate = lazy(() => import('@/pages/Purchase/PurchaseCreate'));
const PurchaseRead = lazy(() => import('@/pages/Purchase/PurchaseRead'));
const Reports = lazy(() => import('@/pages/Reports'));
const Analytics = lazy(() => import('@/pages/Analytics'));

const ReportPage = lazy(() => import('@/pages/Report'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));

const Profile = lazy(() => import('@/pages/Profile'));

const About = lazy(() => import('@/pages/About'));

let routes = {
  master: [
    { path: '/customer', element: <Customer /> },
    { path: '/products', element: <Product /> },
    { path: '/supplier', element: <Supplier /> },
    { path: '/payment/mode', element: <PaymentMode /> },
    { path: '/taxes', element: <Taxes /> },
    { path: '/settings', element: <Settings /> },
    { path: '/settings/edit/:settingsKey', element: <Settings /> },
  ],
  purchasing: [
    { path: '/purchase', element: <Purchase /> },
    { path: '/purchase/create', element: <PurchaseCreate /> },
    { path: '/purchase/read/:id', element: <PurchaseRead /> },
  ],
  delivery: [
    { path: '/deliverynote', element: <DeliveryNote /> },
  ],
  expenses: [
    { path: '/expense', element: <Expense /> },
  ],
  reports: [
    { path: '/reports', element: <Reports /> },
  ],
  analytics: [
    { path: '/analytics', element: <Analytics /> },
  ],
  default: [
    { path: '/login', element: <Navigate to="/" /> },
    { path: '/logout', element: <Logout /> },
    { path: '/about', element: <About /> },
        { path: '/products', element: <Product /> },
    { path: '/products/create', element: <ProductCreate /> },
    { path: '/products/update/:id', element: <ProductUpdate /> },
    { path: '/invoice', element: <Invoice /> },
    { path: '/invoice/create', element: <InvoiceCreate /> },
    { path: '/invoice/read/:id', element: <InvoiceRead /> },
    { path: '/invoice/update/:id', element: <InvoiceUpdate /> },
    { path: '/invoice/pay/:id', element: <InvoiceRecordPayment /> },
    { path: '/quote', element: <Quote /> },
    { path: '/quote/create', element: <QuoteCreate /> },
    { path: '/quote/read/:id', element: <QuoteRead /> },
    { path: '/quote/update/:id', element: <QuoteUpdate /> },
    { path: '/payment', element: <Payment /> },
    { path: '/payment/read/:id', element: <PaymentRead /> },
    { path: '/payment/update/:id', element: <PaymentUpdate /> },
    { path: '/purchase', element: <Purchase /> },
    { path: '/purchase/create', element: <PurchaseCreate /> },
    { path: '/purchase/read/:id', element: <PurchaseRead /> },
    { path: '/profile', element: <Profile /> },
    { path: '*', element: <NotFound /> },
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
      path: '/products',
      element: <Product />,
    },
    {
      path: '/products/create',
      element: <ProductCreate />,
    },
    {
      path: '/products/update/:id',
      element: <ProductUpdate />,
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
      path: '/deliverynote',
      element: <DeliveryNote />,
    },
    {
      path: '/reports',
      element: <ReportPage />,
    },
    {
      path: '/analytics',
      element: <AnalyticsPage />,
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
