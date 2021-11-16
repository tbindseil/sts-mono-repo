"""lazy rollback attempt

Revision ID: 6bb5912581f7
Revises: 320b6941d648
Create Date: 2021-11-05 19:41:25.972303

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6bb5912581f7'
down_revision = '320b6941d648'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('availability_repeatingAvailability_fkey', 'availability', type_='foreignkey')
    op.drop_table('repeating_availability')
    op.drop_column('availability', 'repeatingAvailability')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('availability', sa.Column('repeatingAvailability', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('availability_repeatingAvailability_fkey', 'availability', 'repeating_availability', ['repeatingAvailability'], ['id'])
    op.create_table('repeating_availability',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.PrimaryKeyConstraint('id', name='repeating_availability_pkey')
    )
    # ### end Alembic commands ###