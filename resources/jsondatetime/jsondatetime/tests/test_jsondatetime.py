from unittest import TestCase

import jsondatetime as json
import datetime

class TestBase(TestCase):

    def setUp(self):
        self.test = '{"name": "John Doe", "born": "2021-11-17T01:00:50.205Z"}'
        self.expected = datetime.datetime(2021, 11, 17, 1, 0, 50, 205000)
        # self.datetime_format = '%a, %d %b %Y %H:%M:%S UTC'

    def test_no_dates(self):
        test = '{"name": "John Doe"}'
        try:
            json.loads(test)
        except Exception as e:
            self.fail("Unexpected failure: %s" % e)

    def test_default_date_format(self):
        decoded = json.loads(self.test).get('born')
        self.assertIs(type(decoded), datetime.datetime)
        self.assertEqual(decoded, self.expected)

    def test_date_format(self):
        test = '{"born": "Thu, 1 Mar 2012"}'
        expected = "Thu, 1 Mar 2012"
        decoded = json.loads(test).get('born')
        self.assertIs(type(decoded), str)
        self.assertEqual(decoded, expected)

    def test_object_hook(self):
        decoded = json.loads(self.test, object_hook=self.hook)
        self.assertEqual(decoded.get('born'), self.expected)
        self.assertIn("hookjob", decoded)

    def test_nested_dicts(self):
        test = '{"updated": {"$gte": "2021-11-17T01:00:50.205Z"}}'
        decoded = json.loads(test).get('updated').get('$gte')
        self.assertIs(type(decoded), datetime.datetime)
        self.assertEqual(decoded, self.expected)

    def hook(self, dct):
        dct["hookjob"] = "I'm hooked!"
        return dct

