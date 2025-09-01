require('module-alias/register');

const mockProductRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};
const mockLedgerRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

jest.mock('@/typeorm-data-source', () => ({
  AppDataSource: {
    getRepository: (name) => {
      if (name === 'Product') return mockProductRepo;
      if (name === 'StockLedger') return mockLedgerRepo;
      return {};
    },
  },
}));

const { increaseStock, decreaseStock } = require('@/utils/stock');

beforeEach(() => {
  mockProductRepo.findOne.mockReset();
  mockProductRepo.save.mockReset();
  mockLedgerRepo.create.mockReset();
  mockLedgerRepo.save.mockReset();
});

describe('stock utils', () => {
  test('increaseStock updates product and logs ledger', async () => {
    const product = { id: 1, stock: 10, averageCost: 5 };
    mockProductRepo.findOne.mockResolvedValue(product);
    mockProductRepo.save.mockImplementation((p) => Promise.resolve(p));
    mockLedgerRepo.create.mockImplementation((data) => data);
    mockLedgerRepo.save.mockResolvedValue({});

    const result = await increaseStock({ productId: 1, quantity: 5, cost: 7, refId: 123 });

    expect(result).toBe(product);
    expect(product.stock).toBe(15);
    expect(product.averageCost).toBeCloseTo((10 * 5 + 5 * 7) / 15);
    expect(mockProductRepo.save).toHaveBeenCalledWith(product);
    expect(mockLedgerRepo.create).toHaveBeenCalledWith({
      product: 1,
      quantity: 5,
      type: 'PURCHASE',
      ref: 123,
      cost: 7,
    });
    expect(mockLedgerRepo.save).toHaveBeenCalled();
  });

  test('decreaseStock updates product and logs ledger with average cost', async () => {
    const product = { id: 1, stock: 5, averageCost: 4 };
    mockProductRepo.findOne.mockResolvedValue(product);
    mockProductRepo.save.mockImplementation((p) => Promise.resolve(p));
    mockLedgerRepo.create.mockImplementation((data) => data);
    mockLedgerRepo.save.mockResolvedValue({});

    const result = await decreaseStock({ productId: 1, quantity: 3, refId: 456 });

    expect(result).toBe(product);
    expect(product.stock).toBe(2);
    expect(mockProductRepo.save).toHaveBeenCalledWith(product);
    expect(mockLedgerRepo.create).toHaveBeenCalledWith({
      product: 1,
      quantity: -3,
      type: 'DELIVERY',
      ref: 456,
      cost: 4,
    });
    expect(mockLedgerRepo.save).toHaveBeenCalled();
  });

  test('decreaseStock aborts when stock would be negative', async () => {
    const product = { id: 1, stock: 2, averageCost: 4 };
    mockProductRepo.findOne.mockResolvedValue(product);

    const result = await decreaseStock({ productId: 1, quantity: 5, refId: 789 });

    expect(result).toBeNull();
    expect(mockProductRepo.save).not.toHaveBeenCalled();
    expect(mockLedgerRepo.create).not.toHaveBeenCalled();
    expect(mockLedgerRepo.save).not.toHaveBeenCalled();
  });
});

