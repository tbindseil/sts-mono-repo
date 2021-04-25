import unittest
from unittest.mock import MagicMock

import json
from src.guided_lambda_handler.translators import json_to_model


class TestGLH(unittest.TestCase):

    def test_json_to_model(self):
        class TestModel():
            field = "field"

            def __init__(self, field):
                self.field = field

            def __eq__(self, other):
                return self.field == other.field

        json_str = json.dumps({"field": "not_field"})
        expected = TestModel("not_field")
        actual = json_to_model(json_str, TestModel)
        self.assertEqual(actual, expected)
