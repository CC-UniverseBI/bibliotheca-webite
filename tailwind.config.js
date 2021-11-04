module.exports = {
  purge: {
    content: [
      './components/**/*.vue',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './validators/*.js',
      './slices/**/*.vue',
      './composables/utils/*.ts',
    ],
  },
  theme: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT:
        '0 1px 3px 0 rgba(29, 32, 194, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(29, 32, 194, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(29, 32, 194, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(29, 32, 194, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(29, 32, 194, 0.25)',
      '3xl': '0 35px 60px -15px rgba(29, 32, 194, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
    inset: {
      0: 0,
      10: '10px',
      50: '50px',
      '1/2': '50%',
    },
    extend: {
      fontFamily: {
        display: ['EB Garamond', 'serif'],
        body: ['Inconsolata', 'monospace'],
      },
      maxHeight: {
        0: '0',
        '1/4': '25vh',
        '1/2': '50vh',
        '3/4': '75vh',
        full: '100vh',
      },
      minHeight: {
        0: '0',
        '1/4': '25vh',
        '1/2': '50vh',
        '3/4': '75vh',
        full: '100vh',
      },
      colors: {
        gray: {
          100: '#edece9',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#161619',
          1000: '#0e0e0e',
        },
      },
      fill: {
        none: 'none',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['checked', 'even'],
      borderColor: ['checked'],
    },
    opacity: ({ after }) => after(['disabled']),
    borderStyle: ['last', 'first'],
    borderWidth: ['first'],
  },
}
