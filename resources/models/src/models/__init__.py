from sqlalchemy.ext.declarative import declarative_base


# all models must be imported, and they cannot be imported circularly
# so there is a loose order within the models where they will import each other
# for example, user imports avail and group and its links
# then avail imports avail_series and request

Base = declarative_base()
