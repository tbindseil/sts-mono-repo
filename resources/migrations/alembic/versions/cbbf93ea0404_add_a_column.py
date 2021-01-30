"""Add a column

Revision ID: cbbf93ea0404
Revises: 1975ea83b712
Create Date: 2020-12-13 18:32:42.466876

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cbbf93ea0404'
down_revision = '1975ea83b712'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('account', sa.Column('last_transaction_date', sa.DateTime))


def downgrade():
    op.drop_column('account', 'last_transaction_date')
