import unittest


class SampleTest(unittest.TestCase):

    def test_success(self):
        assert(True)

    def test_fail(self):
        assert(False)


if __name__ == '__main__':
    unittest.main()
