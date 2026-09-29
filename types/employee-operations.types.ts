// types/employee-operations.types.ts

import type {
  Order,
} from './orders.types';

import type {
  Payment,
} from './payment.types';

import type {
  Product,
} from './product.types';

// =====================================================
// SHIFT
// =====================================================

export interface EmployeeShiftRange {
  from:
    string;

  to:
    string;
}

// =====================================================
// SUMMARY
// =====================================================

export interface EmployeeDashboardSummary {
  activeOrders:
    number;

  myOrdersToday:
    number;

  approvedPayments:
    number;

  collectedAmount:
    number;

  unavailableProducts:
    number;
}

// =====================================================
// SNAPSHOT
// =====================================================

export interface EmployeeOperationsSnapshot {
  restaurantOrders:
    Order[];

  employeeOrders:
    Order[];

  payments:
    Payment[];

  products:
    Product[];

  shift:
    EmployeeShiftRange;
}

// =====================================================
// SERVICE OPTIONS
// =====================================================

export interface EmployeeOperationsParams {
  restaurantDocumentId:
    string;

  employeeId:
    number;
}