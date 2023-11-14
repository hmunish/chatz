const {
  sanitizeUserInput,
  isValidInputs,
} = require('../app/utility/input-validation');

test('should return false for invalid inputs', () => {
  expect(sanitizeUserInput('')).toBe(false);
  expect(sanitizeUserInput(' ')).toBe(false);
  expect(sanitizeUserInput("<script>alert('hacked')</script>")).toBe(false);
  expect(sanitizeUserInput('test<test')).toBe(false);
  expect(sanitizeUserInput('test&test')).toBe(false);
});

test('should return true for valid inputs', () => {
  expect(sanitizeUserInput('test-input')).toBe('test-input');
  expect(sanitizeUserInput('test-input-with-valid-symbols-@!?')).toBe(
    'test-input-with-valid-symbols-@!?',
  );
  expect(sanitizeUserInput('123456')).toBe('123456');
});

describe('should check if valid email, password & phone is given', () => {
  test('should return true for valid inputs', () => {
    expect(
      isValidInputs(
        {
          email: 'hello@world.com',
          phone: '123456789',
          password: 'Hello@123',
        },
        'signup',
      ),
    ).toStrictEqual(['hello@world.com', 'Hello@123', '123456789']);
  });
  test('should return false for invalid email id', () => {
    expect(
      isValidInputs({
        email: 'hello@world',
        phone: '123456789',
        password: 'Hello@123',
      }),
    ).toBe(false);
  });
  test('should return false for invalid phone no', () => {
    expect(
      isValidInputs(
        {
          email: 'hello@world.com',
          phone: '12345',
          password: 'Hello@123',
        },
        'signup',
      ),
    ).toBe(false);
  });
});
