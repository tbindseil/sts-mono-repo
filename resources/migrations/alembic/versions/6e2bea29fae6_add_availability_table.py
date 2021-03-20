"""add availability table

Revision ID: 6e2bea29fae6
Revises: 1256fe869399
Create Date: 2021-02-13 18:41:54.710993

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6e2bea29fae6'
down_revision = '1256fe869399'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('availability',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('subjects', sa.String(length=511), nullable=False),
    sa.Column('startTime', sa.DateTime(), nullable=False),
    sa.Column('endTime', sa.DateTime(), nullable=False),
    sa.Column('tutor', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['tutor'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('availability')
    # ### end Alembic commands ###
