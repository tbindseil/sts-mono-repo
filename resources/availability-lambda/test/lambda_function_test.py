import unittest

import lambda_function


# TODO I think its time to delete this

class LambdaFunctionTest(unittest.TestCase):

    def test_json_to_availability(self):
        body = {
            "subjects": "subjects",
            "startTime": "startTime",
            "endTime": "endTime",
            "tutor": "tutor"
        }

        actual = lambda_function.json_to_availability(body)

        assert(actual.subjects == body["subjects"])
        assert(actual.startTime == body["startTime"])
        assert(actual.endtime == body["endtime"])
        assert(actual.tutor == body["tutor"])


if __name__ == '__main__':
    unittest.main()
